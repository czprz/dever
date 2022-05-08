import mssql from '../../../common/helper/mssql/index.js';

"use strict";
export default new class {
    /**
     * Check if conditions for creating database
     * @param execution {Execution}
     * @return {Promise<boolean>}
     */
    async createDatabase(execution) {
        return this.#hasDatabaseName(execution) ??
            await this.#hasDatabase(execution) ??
            true;
    }

    /**
     * Check if conditions for creating table
     * @param execution {Execution}
     * @return {Promise<boolean>}
     */
    async createTable(execution) {
        return this.#hasDatabaseName(execution) ??
            this.#hasTableName(execution) ??
            this.#hasColumns(execution) ??
            await this.#hasTable(execution) ??
            true;
    }

    /**
     * Check if conditions for inserting data
     * @param execution {Execution}
     * @return {Promise<boolean>}
     */
    async columns(execution) {
        return this.#hasDatabaseName(execution) ??
            this.#hasTableName(execution) ??
            this.#hasColumns(execution) ??
            true;
    }

    /**
     * Checks if database name already exists
     * @param execution {Execution}
     * @returns {Promise<boolean|null>}
     */
    async #hasDatabase(execution) {
        if (await mssql.databaseExists(execution.sql)) {
            console.log(`mssql: '${execution.name}' :: database already exists`);
            return false;
        }

        return null;
    }

    /**
     * Checks if database name already exists
     * @param execution {Execution}
     * @returns {boolean|null}
     */
    #hasDatabaseName(execution) {
        if (!execution.sql?.database) {
            console.log(`mssql: '${execution.name}' could not find database name`);
            return false;
        }

        return null;
    }

    /**
     * Checks if database name already exists
     * @param execution {Execution}
     * @returns {Promise<boolean|null>}
     */
    async #hasTable(execution) {
        if (await mssql.tableExists(execution.sql)) {
            console.log(`mssql: '${execution.name}' :: table already exists`);
            return false;
        }

        return null;
    }

    /**
     * Checks if database name already exists
     * @param execution {Execution}
     * @returns {boolean|null}
     */
    #hasTableName(execution) {
        if (execution.sql?.table == null) {
            console.log(`mssql: '${execution.name}' could not find table name`);
            return false;
        }

        return null;
    }

    /**
     * Checks if database name already exists
     * @param execution {Execution}
     * @returns {boolean|null}
     */
    #hasColumns(execution) {
        if (execution.sql?.columns == null) {
            console.log(`mssql: '${execution.name}' could not find columns`);
            return false;
        }

        return null;
    }
}