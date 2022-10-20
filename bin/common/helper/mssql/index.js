import sql from 'mssql';

"use strict";
export default new class {
    /**
     * Creates an MSSQL database
     * @param query {DbQuery}
     * @returns {Promise<void>}
     */
    async createDatabase(query) {
        await this.#connect(query);

        try {
            await this.#createDatabase(query);
        } finally {
            await sql.close();
        }
    }

    /**
     * Drops an MSSQL database
     * @param query {DbQuery}
     * @returns {Promise<void>}
     */
    async dropDatabase(query) {
        await this.#connect(query);

        try {
            await sql.query(`DROP DATABASE ${query.database}`);
        } finally {
            await sql.close();
        }
    }

    /**
     * Checks if database name already exists
     * @param query {DbQuery}
     * @returns {Promise<boolean>}
     */
    async databaseExists(query) {
        await this.#connect(query);

        try {
            const exists = await this.#databaseExists(query);
            sql.close();

            return exists;
        } catch {
            sql.close();
            return false;
        }
    }

    /**
     * Create table within specific database
     * @param query {DbQuery}
     * @returns {Promise<void>}
     */
    async createTable(query) {
        await this.#connect(query);

        if (!await this.#databaseExists(query)) {
            await this.#createDatabase(query);
        }

        try {
            await this.#createTable(query);
        } finally {
            sql.close();
        }
    }

    /**
     * Check if table already exists in database
     * @param query {DbQuery}
     * @returns {Promise<boolean>}
     */
    async tableExists(query) {
        await this.#connect(query);

        try {
            const exists = await this.#tableExists(query);
            sql.close();

            return exists;
        } catch (ex) {
            sql.close();
            throw ex;
        }
    }

    /**
     * Inserts data into existing table
     * @param query {DbQuery}
     * @returns {Promise<void>}
     */
    async insert(query) {
        await this.#connect(query);

        if (!await this.#databaseExists(query)) {
            await this.#createDatabase(query);
        }

        if (!await this.#tableExists(query)) {
            await this.#createTable(query);
        }

        const insert = this.#getInsertQuery(query.columns);
        await sql.query(`INSERT INTO ${query.database}.dbo.${query.table} ${insert}`);

        await sql.close();
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

    /**
     * Maps DbColumn into query string
     * @param dbColumns {DbColumn[]}
     * @return {string}
     */
    #getInsertQuery(dbColumns) {
        let columns = '';
        let values = '';

        for (const column of dbColumns) {
            columns += `${column?.key},`;
            values += `'${column?.value}',`;
        }

        columns = columns.slice(0, -1);
        values = values.slice(0, -1);

        return `(${columns}) VALUES (${values})`;
    }

    /**
     * Check if database exists
     * @param query {DbQuery}
     * @return {Promise<boolean>}
     */
    async #databaseExists(query) {
        const value = await sql.query(`SELECT CAST(CASE WHEN (SELECT name FROM master.sys.databases WHERE name = '${query.database}') IS NULL THEN 0 ELSE 1 END As bit) as dbExists`);

        if (value.recordset == null || value.recordset.length === 0) {
            throw 'Could not check if database exists';
        }

        return value.recordset[0].dbExists;
    }

    /**
     * Create database
     * @param query {DbQuery}
     * @return {Promise<void>}
     */
    async #createDatabase(query) {
        await sql.query(`CREATE DATABASE ${query.database}`);
    }

    /**
     * Check if table exists
     * @param query {DbQuery}
     * @return {Promise<boolean>}
     */
    async #tableExists(query) {
        const value = await sql.query(`SELECT CAST(CASE WHEN (SELECT TABLE_NAME FROM ${query.database}.INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = '${query.table}') IS NULL THEN 0 ELSE 1 END as bit) as tableExists`);

        if (value.recordset == null || value.recordset.length === 0) {
            throw 'could not check if table exists';
        }

        return value.recordset[0].tableExists;
    }

    /**
     * Create table
     * @param query {DbQuery}
     * @return {Promise<void>}
     */
    async #createTable(query) {
        const statement = this.#getTableCreationQuery(query);
        await sql.query(`CREATE TABLE ${statement}`);
    }

    /**
     * Drop table
     * @param query {DbQuery}
     * @return {Promise<void>}
     */
    async dropTable(query) {
        await sql.query(`DROP TABLE ${query.database}.dbo.${query.table}`);
    }

    /**
     *
     * @param query {DbQuery}
     * @return {string}
     */
    #getTableCreationQuery(query) {
        if (typeof query.columns === 'string') {
            throw new Error('Table creation query cannot be run with a string');
        }

        let statement = '';
        for (const column of query.columns) {
            statement += `${column.key} ${column.valueType}, `;
        }

        return `${query.database}.dbo.${query.table} (${statement.slice(0, -2)})`;
    }
}