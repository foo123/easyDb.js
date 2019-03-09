# easyDb.js

**Database abstraction layer (DBAL)** for `Node.js` (supports `mysql`, `postgres`, `sqlite3`,..)

version 0.9.0

`easyDb` is a database abstraction layer (`DBAL`) for `Node.js`. It provides a unified way to access many different db drivers through a common API which supports both `callbacks` and `promises` plus literals and identifiers escaping, prepared queries and more.

See also [Dialect](https://github.com/foo123/Dialect) which is a cross-platform &amp; cross-vendor SQL Query Builder for `Node.js` / `PHP` / `Python` and which can be used in conjunction with this framework to abstract sql query building easily.


### DB Drivers supported

* `Mysql` (requires [`node-mysql2`](https://github.com/sidorares/node-mysql2) module)
* `Postgres` (requires [`node-postgres`](https://github.com/brianc/node-postgres) module)
* `Sqlite` (requires [`node-sqlite3`](https://github.com/mapbox/node-sqlite3) module)
* it is easy to extend to other drivers as well.
