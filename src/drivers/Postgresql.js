"use strict";

module.exports = function( Db ) {
    var PROTO = 'prototype', pg = null;

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
        this.quotes = ["E'","'","''","''"];
        // call super constructor
        Db.call(this, config);
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
    
    Postgresql[PROTO].query = function( sql, cb ) {
        var self = this;
        sql = ''+sql;
        // https://github.com/brianc/node-postgres/issues/1846
        this.connect().connection.query(sql, function(err, result){
            if ( err )
            {
                cb(err, null);
                return;
            }
            // normalise result
            var res;
            if ( /^select\b/i.test(sql) )
            {
                res = result.rows;
            }
            else
            {
                self.insertId = result.insertId || null;
                res = {
                    insertId: self.insertId,
                    affectedRows: result.affectedRows || null
                };
            }
            cb(null, res);
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
            if ( /^select\b/i.test(sql) )
            {
                res = result.rows;
            }
            else
            {
                self.insertId = result.insertId || null;
                res = {
                    insertId: self.insertId,
                    affectedRows: result.affectedRows || null
                };
            }
            cb(null, res);
        });
        return this;
    };

    return Postgresql;
};
