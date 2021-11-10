module.exports = {
    createDatabase: createDatabase,
    databaseExists: databaseExists
}

const sql = require('mssql');

const DB_USERNAME = 'sa';
const DB_PASSWORD = '123456789Qwerty';

/**
 * Creates an MSSQL database
 * @param dbName {string}
 * @returns {Promise<void>}
 */
async function createDatabase(dbName) {
    await connect();
    await sql.query(`CREATE DATABASE ${dbName}`);
    await sql.close();
}

/**
 * Checks if database name already exists
 * @param dbName {string}
 * @returns {Promise<*>}
 */
async function databaseExists(dbName) {
    await connect();
    const value = await sql.query(`SELECT CAST(CASE WHEN (SELECT name FROM master.sys.databases WHERE name = N'${dbName}') IS NULL THEN 0 ELSE 1 END As bit) as dbExists`);
    await sql.close();

    if (value.recordset == null || value.recordset.length === 0) {
        throw 'Could not check if database exists';
    }

    return value.recordset[0].dbExists;
}

async function connect() {
    await sql.connect({
        server: "localhost",
        user: DB_USERNAME,
        password: DB_PASSWORD,
        options: {
            trustServerCertificate: true
        }
    });
}

class Database {
    /**
     * Supported options for running MSSQL
     * Currently supported options ('create-database')
     * @var {string}
     */
    option;

    /**
     * Database name
     * @var {string}
     */
    db_name;
}