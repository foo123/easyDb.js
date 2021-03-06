/**
*   easyDb,
*   a DBAL abstraction for node.js supporting Mysql, Postgresql and Sqlite
*
*   https://github.com/foo123/easyDb.js
*   @version: 0.9.0
**/
!function( root, name, factory ){
"use strict";
if ( ('object'===typeof module)&&module.exports ) /* CommonJS */
    (module.$deps = module.$deps||{}) && (module.exports = module.$deps[name] = factory.call(root));
else if ( ('function'===typeof define)&&define.amd&&('function'===typeof require)&&('function'===typeof require.specified)&&require.specified(name) /*&& !require.defined(name)*/ ) /* AMD */
    define(name,['module'],function(module){factory.moduleUri = module.uri; return factory.call(root);});
else if ( !(name in root) ) /* Browser/WebWorker/.. */
    (root[name] = factory.call(root)||1)&&('function'===typeof(define))&&define.amd&&define(function(){return root[name];} );
}(  /* current root */          'undefined' !== typeof self ? self : this,
    /* module name */           "easyDb",
    /* module factory */        function ModuleFactory__easyDb( undef ){
"use strict";

var VERSION = '0.9.0', PROTO = 'prototype',
    NotImplemented = new Error("Not Implemented!"),
    NULL_CHAR = String.fromCharCode( 0 )
;

function addslashes( s, chars, esc )
{
    var s2 = '', i, l, c;
    if ( 3 > arguments.length ) esc = '\\';
    if ( 2 > arguments.length ) chars = '\\"\'' + NULL_CHAR;
    for (i=0,l=s.length; i<l; i++)
    {
        c = s.charAt( i );
        s2 += -1 === chars.indexOf( c ) ? c : (0 === c.charCodeAt(0) ? '\\0' : (esc+c));
    }
    return s2;
}

var Db = function(config, quotes) { 
    // by default use postgres-like quotes which are default for sql in general
    if ( 2 > arguments.length || null == quotes ) quotes = [["'","'","''","''"],["\"","\"","\"\"","\"\""]];
    this.quotes = quotes;
    this.config = config || {};
};
Db.VERSION = VERSION;
Db.SELECT_RE = /^\s*select\b/i;
Db[PROTO] = {

    constructor: Db,
    
    // by default use Mysql-like quotes
    quotes: null,
    config: null,
    insertId: null,
    
    dispose: function( ) {
        this.quotes = null;
        this.config = null;
        return this;
    },
    
    // abstract methods, need implementation
    query: function( sql, cb ){
        throw NotImplemented;
    },
    
    prepare: function( sql, cb ){
        throw NotImplemented;
    },
    
    exec: function( sql, repl, cb ){
        throw NotImplemented;
    },
    
    lastInsertId: function( ){
        return this.insertId || null;
    },
    
    queryPromise: function( sql ){
        if ( 'function' === typeof Promise )
        {
            var self = this;
            return new Promise(function(resolve,reject){
                self.query(sql, function(err, result){
                    if ( err ) reject(err);
                    else resolve(result);
                });
            });
        }
        return null;
    },
    
    preparePromise: function( sql ){
        if ( 'function' === typeof Promise )
        {
            var self = this;
            return new Promise(function(resolve,reject){
                self.prepare(sql, function(err, result){
                    if ( err ) reject(err);
                    else resolve(result);
                });
            });
        }
        return null;
    },
    
    execPromise: function( sql, repl ){
        if ( 'function' === typeof Promise )
        {
            var self = this;
            return new Promise(function(resolve,reject){
                self.exec(sql, repl, function(err, result){
                    if ( err ) reject(err);
                    else resolve(result);
                });
            });
        }
        return null;
    },
    
    escape: function( v, cb ) {
        var self = this, chars, esc, i, l, ve, c, q;
        // simple string ecsaping using addslashes
        // '"\ and NUL (the NULL byte).
        q = self.quotes[0];
        chars = NULL_CHAR + '\\'; esc = '\\';
        v = String(v); ve = '';
        for(i=0,l=v.length; i<l; i++)
        {
            c = v.charAt(i);
            if ( q[0] === c ) ve += q[2];
            else if ( q[1] === c ) ve += q[3];
            else ve += addslashes( c, chars, esc );
        }
        if ( 'function' === typeof cb ) cb(null, ve);
        return ve;
    },
    
    escapeId: function( v, cb ) {
        var self = this, i, l, ve, c, q;
        // simple identifier ecsaping using for example quotes doubling
        q = self.quotes[1];
        v = String(v); ve = '';
        for(i=0,l=v.length; i<l; i++)
        {
            c = v.charAt(i);
            if ( q[0] === c ) ve += q[2];
            else if ( q[1] === c ) ve += q[3];
            else ve += c;
        }
        if ( 'function' === typeof cb ) cb(null, ve);
        return ve;
    },
    
    escapeWillQuote: function( ) {
        // whether escape functions will quote as well (ie wrap output in quotes or not)
        return false;
    }
};
Db.DRIVER = {};

// factory method to get appriopriate db driver implementation according to config
Db.getDb = function(config){
    config = config || {};
    var driver = config['driver'] ? (''+config['driver']).toLowerCase() : null;
    var db = null;
    switch( driver )
    {
        //case 'mariadb':
        case 'mysqli':
        case 'mysql':
            if ( !Db.DRIVER.Mysql )
                Db.DRIVER.Mysql = require('./drivers/Mysql.js')(Db);
            db = new Db.DRIVER.Mysql(config[driver] || config[driver.toUpperCase()] || config);
            break;
        case 'postgre':
        case 'postgres':
        case 'postgresql':
            if ( !Db.DRIVER.Postgresql )
                Db.DRIVER.Postgresql = require('./drivers/Postgresql.js')(Db);
            db = new Db.DRIVER.Postgresql(config[driver] || config[driver.toUpperCase()] || config);
            break;
        case 'sqlite3':
        case 'sqlite':
            if ( !Db.DRIVER.Sqlite )
                Db.DRIVER.Sqlite = require('./drivers/Sqlite.js')(Db);
            db = new Db.DRIVER.Sqlite(config[driver] || config[driver.toUpperCase()] || config);
            break;
    }
    return db;
};

// export it
return Db;
});
