const Pool = require('pg').Pool;

//replace values with own settigns
const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "test",
    password:"kalleM",
    port: 5432,
});

module.exports = pool;