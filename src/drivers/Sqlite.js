"use strict";

module.exports = function( Db ) {
    var PROTO = 'prototype', sqlite = null;

    // requires sqlite3 node module
    // https://github.com/mapbox/node-sqlite3
    try {
        sqlite = require('sqlite3');
    } catch(e) {
        sqlite = null;
    }
    
    var Sqlite = function( config ) { 
        if ( !sqlite )
        {
            throw new Error('sqlite3 module is not installed!');
        }
        this.quotes = ["'","'","''","''"];
        // call super constructor
        Db.call(this, config);
    };

    Sqlite[PROTO] = Object.create(Db[PROTO]);

    Sqlite[PROTO].connection = null;

    Sqlite[PROTO].connect = function( ) {
        if ( !this.connection )
        {
            var config = this.config;
            this.connection = new sqlite3.Database(config.database||':memory:');
        }
        return this;
    };
    
    Sqlite[PROTO].dispose = function( ) {
        if ( this.connection )
        {
            this.connection.close();
            this.connection = null;
        }
        return Db[PROTO].dispose.call(this);
    };
    
    Sqlite[PROTO].query = function( sql, cb ) {
        this.connect().connection.run(''+sql, [], function(err,res){
            // TODO, needs completion for select-type queries to return matched rows results
            if ( err )
            {
                cb(err, null);
                return;
            }
            cb(null, res);
        });
        return this;
    };

    Sqlite[PROTO].prepare = function( sql, repl, cb ) {
        this.connect().connection.prepare(''+sql, repl, cb);
        return this;
    };

    return Sqlite;
};
