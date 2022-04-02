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
        await this.#connect(query, true);
        const statement = this.#getTableCreationQuery(query);
        await sql.query(`CREATE TABLE ${statement}`);
        await sql.close();
    }

    /**
     * Check if table already exists in database
     * @param query {DbQuery}
     * @returns {Promise<boolean>}
     */
    async tableExists(query) {
        const tableName = this.#getTableName(query); // Todo: Create a better solution for handling table name instead of two possible ways of obtaining it
        await this.#connect(query);
        const value = await sql.query(`SELECT CAST(CASE WHEN (SELECT TABLE_NAME FROM ${query.database}.INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = '${tableName}') IS NULL THEN 0 ELSE 1 END as bit) as tableExists`);
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
        await this.#connect(query, true);
        const insert = this.#getInsertQuery(query.data);
        await sql.query(`INSERT INTO ${insert}`);
        await sql.close();
    }

    /**
     * Establish SQL connection
     * @param query {DbQuery}
     * @param withDatabase {boolean}
     * @return {Promise<void>}
     */
    async #connect(query, withDatabase = false) {
        await sql.connect({
            server: "localhost",
            user: query.username,
            password: query.password,
            database: withDatabase ? query.database : undefined,
            options: {
                trustServerCertificate: true
            }
        });
    }

    /**
     * Maps DbColumn into query string
     * @param dbColumns {DbColumn[]}
     * @return {string}
     */
    #getInsertQuery(dbColumns) {
        let columns = '';
        let values = '';

        for (const column of dbColumns) {
            columns += `'${column.key}',`;
            values += `'${column.value}',`;
        }

        columns = columns.slice(0, -1);
        values = columns.slice(0, -1);

        return `(${columns}) VALUES (${values})`;
    }

    /**
     *
     * @param query {DbQuery}
     * @return {string}
     */
    #getTableCreationQuery(query) {
        if (typeof query.table === 'string') {
            throw new Error('Table creation query cannot be run with a string');
        }

        let statement = '';
        for (const column of query.table.columns) {
            statement += `${column.key} ${column.valueType}, `;
        }

        return `dbo.${query.table.name} (${statement.slice(0, -2)})`;
    }

    /**
     * Gets table name
     * @param query {DbQuery}
     * @return {string}
     */
    #getTableName(query) {
        if (query.table == null) {
            // Todo: Pass runtime here for getting execution name
            console.error('Missing table name');
            return '';
        }

        return typeof query.table === 'string' ? query.table : query.table.name;
    }
}