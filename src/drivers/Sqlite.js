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
        // call super constructor
        Db.call(this, config, [["'","'","''","''"],["\"","\"","\"\"","\"\""]]);
    };

    Sqlite[PROTO] = Object.create(Db[PROTO]);

    Sqlite[PROTO].connection = null;

    Sqlite[PROTO].connect = function( ) {
        if ( !this.connection )
        {
            var config = this.config;
            this.connection = new sqlite.Database(config.database||':memory:');
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
        var self = this;
        sql = ''+sql;
        // https://github.com/mapbox/node-sqlite3/issues/1125
        if ( Db.SELECT_RE.test(sql) )
        {
            this.connect().connection.all(sql, [], function(err,rows){
                if ( err )
                {
                    cb(err, null);
                    return;
                }
                // normalise result
                var res;
                res = rows;
                cb(null, res);
            });
        }
        else
        {
            this.connect().connection.run(sql, [], function(err){
                if ( err )
                {
                    cb(err, null);
                    return;
                }
                // normalise result
                var res;
                self.insertId = this.lastID || null;
                res = {
                    insertId: self.insertId,
                    affectedRows: this.changes || null
                };
                cb(null, res);
            });
        }
        return this;
    };

    Sqlite[PROTO].exec = function( sql, repl, cb ) {
        var self = this;
        sql = ''+sql;
        // https://github.com/mapbox/node-sqlite3/issues/1125
        if ( Db.SELECT_RE.test(sql) )
        {
            this.connect().connection.all(sql, repl, function(err,rows){
                if ( err )
                {
                    cb(err, null);
                    return;
                }
                // normalise result
                var res;
                res = rows;
                cb(null, res);
            });
        }
        else
        {
            this.connect().connection.run(sql, repl, function(err){
                if ( err )
                {
                    cb(err, null);
                    return;
                }
                // normalise result
                var res;
                self.insertId = this.lastID || null;
                res = {
                    insertId: self.insertId,
                    affectedRows: this.changes || null
                };
                cb(null, res);
            });
        }
        return this;
    };

    Sqlite[PROTO].prepare = function( sql, repl, cb ) {
        this.connect().connection.prepare(''+sql, repl, cb);
        return this;
    };

    return Sqlite;
};
