module.exports = {
    createDatabase: createDatabase,
    databaseExists: databaseExists,
    createTable: createTable,
    tableExists: tableExists,
    insertInto: insertInto
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
    const value = await sql.query(`SELECT CAST(CASE WHEN (SELECT name FROM master.sys.databases WHERE name = '${dbName}') IS NULL THEN 0 ELSE 1 END As bit) as dbExists`);
    await sql.close();

    if (value.recordset == null || value.recordset.length === 0) {
        throw 'Could not check if database exists';
    }

    return value.recordset[0].dbExists;
}

/**
 * Create table within specific database
 * @param command {string}
 * @returns {Promise<void>}
 */
async function createTable(command) {
    await connect();
    await sql.query(`CREATE TABLE ${command}`);
    await sql.close();
}

/**
 * Check if table already exists in database
 * @param databaseName string
 * @param tableName string
 * @returns {Promise<boolean>}
 */
async function tableExists(databaseName, tableName) {
    await connect();
    const value = await sql.query(`SELECT CAST(CASE WHEN (SELECT TABLE_NAME FROM ${databaseName}.INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = '${tableName}') IS NULL THEN 0 ELSE 1 END as bit) as tableExists`);
    await sql.close();

    if (value.recordset == null || value.recordset.length === 0) {
        throw 'could not check if table exists';
    }

    return value.recordset[0].tableExists;
}

/**
 * INSERT INTO mssql command
 * @param command {string}
 * @returns {Promise<void>}
 */
async function insertInto(command) {
    await connect();
    await sql.query(`INSERT INTO ${command}`);
    await sql.close();
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
