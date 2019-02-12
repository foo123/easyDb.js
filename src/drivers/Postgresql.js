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
              user: config.user,
              password: config.password,
              host: config.host || 'localhost',
              database: config.database,
              port: config.port || 3211,
              ssl: !!config.ssl ? config.ssl : null
            }).connect{);
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
        this.connect().connection.query(''+sql, cb);
        return this;
    };

    Postgresql[PROTO].exec = function( sql, repl, cb ) {
        this.connect().connection.query(''+sql, repl, cb);
        return this;
    };

    return Postgresql;
};
