"use strict";

module.exports = function( Db ) {
    var PROTO = 'prototype', mysql = null;

    // requires mysql2 node module
    // https://github.com/sidorares/node-mysql2
    try {
        mysql = require('mysql2');
    } catch(e) {
        mysql = null;
    }
    
    var Mysql = function( config ) { 
        if ( !mysql )
        {
            throw new Error('mysql2 module is not installed!');
        }
        this.quotes = ["'","'","\\'","\\'"];
        // call super constructor
        Db.call(this, config);
    };

    Mysql[PROTO] = Object.create(Db[PROTO]);

    Mysql[PROTO].connection = null;

    Mysql[PROTO].connect = function( ) {
        if ( !this.connection )
        {
            var config = this.config;
            this.connection = mysql.connect({
                host: config.host || 'localhost',
                port: config.port || 3306,
                user: config.user,
                password: config.password,
                database: config.database,
                charset: config.charset || 'UTF8_GENERAL_CI',
                multipleStatements: !!config.multipleStatements,
                debug: !!config.debug,
                supportBigNumbers: !!config.supportBigNumbers,
                bigNumberStrings: !!config.bigNumberStrings,
                dateStrings: null == config.dateStrings ? true : !!config.dateStrings
            });
        }
        return this;
    };
    
    Mysql[PROTO].dispose = function( ) {
        if ( this.connection )
        {
            this.connection.close();
            this.connection = null;
        }
        return Db[PROTO].dispose.call(this);
    };
    
    Mysql[PROTO].escape = function( s, cb ) {
        var se = this.connect().connection.escape(''+s);
        if ( 'function' === typeof cb ) cb(null, se);
        return se;
    };

    Mysql[PROTO].escapeId = function( s, cb ) {
        var se = this.connect().connection.escapeId(''+s);
        if ( 'function' === typeof cb ) cb(null, se);
        return se;
    };

    Mysql[PROTO].query = function( sql, cb ) {
        var self = this;
        sql = ''+sql;
        this.connect().connection.query(sql, function(err, result, fields){
            if ( err )
            {
                cb(err, null);
                return;
            }
            // normalise result
            var res;
            if ( /^select\b/i.test(sql) )
            {
                res = result;
            }
            else
            {
                self.insertId = result.insertId || null;
                res = {
                    insertId: self.insertId,
                    affectedRows: result.affectedRows /*|| result.changedRows*/ || null
                };
            }
            cb(null, res);
        });
        return this;
    };

    Mysql[PROTO].exec = function( sql, repl, cb ) {
        var self = this;
        sql = ''+sql;
        this.connect().connection.execute(sql, repl, function(err, result, fields){
            if ( err )
            {
                cb(err, null);
                return;
            }
            // normalise result
            var res;
            if ( /^select\b/i.test(sql) )
            {
                res = result;
            }
            else
            {
                self.insertId = result.insertId || null;
                res = {
                    insertId: self.insertId,
                    affectedRows: result.affectedRows /*|| result.changedRows*/ || null
                };
            }
            cb(null, res);
        });
        return this;
    };

    return Mysql;
};
