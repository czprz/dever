const sql = require('mssql');

module.exports = new class {
    /**
     * Creates an MSSQL database
     * @param query {DbQuery}
     * @returns {Promise<void>}
     */
    async createDatabase(query) {
        await this.#connect(query);
        await sql.query(`CREATE DATABASE ${query.database}`);
        await sql.close();
    }

    /**
     * Checks if database name already exists
     * @param query {DbQuery}
     * @returns {Promise<*>}
     */
    async databaseExists(query) {
        await this.#connect(query);
        const value = await sql.query(`SELECT CAST(CASE WHEN (SELECT name FROM master.sys.databases WHERE name = '${query.database}') IS NULL THEN 0 ELSE 1 END As bit) as dbExists`);
        await sql.close();

        if (value.recordset == null || value.recordset.length === 0) {
            throw 'Could not check if database exists';
        }

        return value.recordset[0].dbExists;
    }

    /**
     * Create table within specific database
     * @param query {DbQuery}
     * @returns {Promise<void>}
     */
    async createTable(query) {
        await this.#connect(query);
        await sql.query(`CREATE TABLE ${query.database}`);
        await sql.close();
    }

    /**
     * Check if table already exists in database
     * @param query {DbQuery}
     * @returns {Promise<boolean>}
     */
    async tableExists(query) {
        await this.#connect(query);
        const value = await sql.query(`SELECT CAST(CASE WHEN (SELECT TABLE_NAME FROM ${query.database}.INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = '${query.table}') IS NULL THEN 0 ELSE 1 END as bit) as tableExists`);
        await sql.close();

        if (value.recordset == null || value.recordset.length === 0) {
            throw 'could not check if table exists';
        }

        return value.recordset[0].tableExists;
    }

    /**
     * Inserts data into existing table
     * @param query {DbQuery}
     * @returns {Promise<void>}
     */
    async insert(query) {
        await this.#connect(query);
        const insert = this.#mapDbDataToInsertQuery(query.data);
        await sql.query(`INSERT INTO ${insert}`);
        await sql.close();
    }

    /**
     * Maps DbData into query string
     * @param dbData {DbData[]}
     * @return {string}
     */
    #mapDbDataToInsertQuery(dbData) {
        let columns = '';
        let values = '';

        for (const data of dbData) {
            columns += `'${data.key}',`;
            values += `'${data.value}',`;
        }

        columns = columns.slice(0, -1);
        values = columns.slice(0, -1);

        return `(${columns}) VALUES (${values})`;
    }

    /**
     * Establish SQL connection
     * @param query {DbQuery}
     * @return {Promise<void>}
     */
    async #connect(query) {
        await sql.connect({
            server: "localhost",
            user: query.username,
            password: query.password,
            options: {
                trustServerCertificate: true
            }
        });
    }
}