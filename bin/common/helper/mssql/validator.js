import mssql from '../../../common/helper/mssql/index.js';

import {Execute} from "../../../new_executor/action-mapper.js";

"use strict";
export default new class {
    /**
     * Check conditions for dropping database
     * @param execute {Execute}
     * @return {Promise<boolean>}
     */
    async dropDatabase(execute) {
        return this.#hasDatabaseName(execute) ??
            await this.#hasDatabase(execute, true) ??
            true;
    }

    /**
     * Check conditions for creating database
     * @param execute {Execute}
     * @return {Promise<boolean>}
     */
    async createDatabase(execute) {
        return this.#hasDatabaseName(execute) ??
            await this.#hasDatabase(execute, false) ??
            true;
    }

    /**
     * Check conditions for creating table
     * @param execute {Execute}
     * @return {Promise<boolean>}
     */
    async createTable(execute) {
        return this.#hasDatabaseName(execute) ??
            this.#hasTableName(execute) ??
            this.#hasColumns(execute) ??
            await this.#hasTable(execute) ??
            true;
    }

    /**
     * Check conditions for creating columns
     * @param execute {Execute}
     * @return {Promise<boolean>}
     */
    async columns(execute) {
        return this.#hasDatabaseName(execute) ??
            this.#hasTableName(execute) ??
            this.#hasColumns(execute) ??
            true;
    }

    /**
     * Checks if database name already exists
     * @param execute {Execute}
     * @param ignore {boolean}
     * @returns {Promise<boolean|null>}
     */
    async #hasDatabase(execute, ignore) {
        if (await mssql.databaseExists(execute.sql)) {
            if (!ignore) {
                console.log(`mssql: '?' :: database already exists`);
            }

            return false;
        }

        return null;
    }

    /**
     * Checks conditions for creating table
     * @param execution {Execute}
     * @returns {Promise<boolean|null>}
     */
    async #hasTable(execution) {
        if (await mssql.tableExists(execution.sql)) {
            console.log(`mssql: '?' :: table already exists`);
            return false;
        }

        return null;
    }

    /**
     * Checks if database property is set
     * @param executable {Execute}
     * @returns {boolean|null}
     */
    #hasDatabaseName(executable) {
        if (executable.sql?.database == null) {
            console.log(`mssql: '?' could not find database name`);
            return false;
        }

        return null;
    }

    /**
     * Checks if table property is set
     * @param execution {Execute}
     * @returns {boolean|null}
     */
    #hasTableName(execution) {
        if (execution.sql?.table == null) {
            console.log(`mssql: '?' could not find table name`);
            return false;
        }

        return null;
    }

    /**
     * Checks if column property is set
     * @param executable {Execute}
     * @returns {boolean|null}
     */
    #hasColumns(executable) {
        if (executable.sql?.columns == null) {
            console.log(`mssql: '?' could not find columns`);
            return false;
        }

        return null;
    }
}