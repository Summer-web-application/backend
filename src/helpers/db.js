const Pool = require('pg').Pool;

const executeQuery = (sql,values=[]) => {
    return new Promise(async(resolve,reject) => {
        try {
            const pool = openDb();
            const result = await pool.query(sql,values);
            resolve(result);
        } catch (error) {
            //change promise state to rejected if failed
            reject(error.message);
        }
    })
}
//replace values with own settigns
const openDb = () => {
    const pool = new Pool({
        user: "postgres",
        host: "localhost",
        database: "test",
        password:"kalleM",
        port: 5432,
    });
    return pool;
}


module.exports = executeQuery;