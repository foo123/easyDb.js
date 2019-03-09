"use strict";

module.exports = function( Db ) {
    var PROTO = 'prototype', pg = null;

    // adapted from https://github.com/datalanche/node-pg-format
    // Ported from PostgreSQL 9.2.4 source code in src/interfaces/libpq/fe-exec.c
    function quoteIdent(value) {

        var ident = ''+value; // create copy

        var quoted = '"';

        for (var i = 0; i < ident.length; i++) {
            var c = ident.charAt(i);
            if (c === '"') {
                quoted += c + c;
            } else {
                quoted += c;
            }
        }

        quoted += '"';

        return quoted;
    };

    // Ported from PostgreSQL 9.2.4 source code in src/interfaces/libpq/fe-exec.c
    function quoteLiteral(value) {

        var literal = null;
        var explicitCast = null;

        literal = ''+value; // create copy

        var hasBackslash = false;
        var quoted = '\'';

        for (var i = 0; i < literal.length; i++) {
            var c = literal.charAt(i);
            if (c === '\'') {
                quoted += c + c;
            } else if (c === '\\') {
                quoted += c + c;
                hasBackslash = true;
            } else {
                quoted += c;
            }
        }

        quoted += '\'';

        if (hasBackslash === true) {
            quoted = 'E' + quoted;
        }

        if (explicitCast) {
            quoted += '::' + explicitCast;
        }

        return quoted;
    };

    // requires postgres node module
    // https://github.com/brianc/node-postgres
    try {
        pg = require('pg');
    } catch(e) {
        pg = null;
    }
    
    var Postgresql = function( config ) { 
        if ( !pg )
        {
            throw new Error('pg module is not installed!');
        }
        // call super constructor
        Db.call(this, config, [["'","'","''","''"],["\"","\"","\"\"","\"\""]]);
    };

    Postgresql[PROTO] = Object.create(Db[PROTO]);

    Postgresql[PROTO].connection = null;

    Postgresql[PROTO].connect = function( ) {
        if ( !this.connection )
        {
            var config = this.config;
            this.connection = new pg.Client(!!config.connectionString ? {
              connectionString: config.connectionString
            } : {
              host: config.host || 'localhost',
              port: config.port || 3211,
              user: config.user,
              password: config.password,
              database: config.database,
              ssl: !!config.ssl ? config.ssl : null
            });
            this.connection.connect();
        }
        return this;
    };
    
    Postgresql[PROTO].dispose = function( ) {
        if ( this.connection )
        {
            this.connection.end();
            this.connection = null;
        }
        return Db[PROTO].dispose.call(this);
    };
    
    Postgresql[PROTO].escape = function( v, cb ) {
        var ve = quoteLiteral(''+v);
        if ( 'function' === typeof cb ) cb(null, ve);
        return ve;
    };

    Postgresql[PROTO].escapeId = function( v, cb ) {
        var ve = quoteIdent(''+v);
        if ( 'function' === typeof cb ) cb(null, ve);
        return ve;
    };
    
    Postgresql[PROTO].escapeWillQuote = function( ) {
        return true;
    };

    Postgresql[PROTO].query = function( sql, cb ) {
        var self = this;
        sql = ''+sql;
        // https://github.com/brianc/node-postgres/issues/1846
        // https://node-postgres.com/api/result#-code-result-rowcount-int-code-
        this.connect().connection.query(sql, function(err, result){
            if ( err )
            {
                cb(err, null);
                return;
            }
            // normalise result
            var res;
            if ( Db.SELECT_RE.test(sql) )
            {
                res = result.rows;
                cb(null, res);
            }
            else
            {
                var command = result.command.toUpperCase();
                if ( 'INSERT' === command || 'REPLACE' === command )
                {
                    self.connection.query('SELECT lastval()', function(err, r){
                        if ( !err && r.rows && r.rows.length )
                        {
                            self.insertId = r.rows[0][0] || r.rows[0]['lastval()'] || r.rows[0]['lastval'] || null;
                        }
                        else
                        {
                            self.insertId = null;
                        }
                        res = {
                            insertId: self.insertId,
                            affectedRows: result.rowCount || null
                        };
                        cb(null, res);
                    });
                }
                else
                {
                    self.insertId = null;
                    res = {
                        insertId: self.insertId,
                        affectedRows: result.rowCount || null
                    };
                    cb(null, res);
                }
            }
        });
        return this;
    };

    Postgresql[PROTO].exec = function( sql, repl, cb ) {
        var self = this;
        sql = ''+sql;
        this.connect().connection.query(sql, repl, function(err, result){
            if ( err )
            {
                cb(err, null);
                return;
            }
            // normalise result
            var res;
            if ( Db.SELECT_RE.test(sql) )
            {
                res = result.rows;
                cb(null, res);
            }
            else
            {
                var command = result.command.toUpperCase();
                if ( 'INSERT' === command || 'REPLACE' === command )
                {
                    self.connection.query('SELECT lastval()', function(err, r){
                        if ( !err && r.rows && r.rows.length )
                        {
                            self.insertId = r.rows[0][0] || r.rows[0]['lastval()'] || r.rows[0]['lastval'] || null;
                        }
                        else
                        {
                            self.insertId = null;
                        }
                        res = {
                            insertId: self.insertId,
                            affectedRows: result.rowCount || null
                        };
                        cb(null, res);
                    });
                }
                else
                {
                    self.insertId = null;
                    res = {
                        insertId: self.insertId,
                        affectedRows: result.rowCount || null
                    };
                    cb(null, res);
                }
            }
        });
        return this;
    };

    return Postgresql;
};
