# easyDb.js

**Database access layer abstraction** for `Node.js` (supports `mysql`, `postgres`, `sqlite`,..)

version 0.9.0

`easyDb` is a database access layer abstraction (`DBAL`) for `Node.js`. It provides a unified way to access many different db drivers through a common API which supports both `callbacks` and `promises`.


### DB Drivers supported

* `Mysql` (requires [`node-mysql2`](https://github.com/sidorares/node-mysql2) module)
* `Postgres` (requires [`node-postgres`](https://github.com/brianc/node-postgres) module)
* `Sqlite` (requires [`node-sqlite3`](https://github.com/mapbox/node-sqlite3) module)
* it is easy to extend to other drivers as well.
