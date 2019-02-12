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
    
    Mysql[PROTO].query = function( sql, cb ) {
        this.connect().connection.query(''+sql, cb);
        return this;
    };

    Mysql[PROTO].exec = function( sql, repl, cb ) {
        this.connect().connection.execute(''+sql, repl, cb);
        return this;
    };

    return Mysql;
};
