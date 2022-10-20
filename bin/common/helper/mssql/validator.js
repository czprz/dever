import mssql from '../../../common/helper/mssql/index.js';
import {Execute} from "../../../execution/executor/action-mapper.js";

"use strict";
export default new class {
    /**
     * Check conditions for dropping database
     * @param execute {Execute}
     * @return {Promise<SqlResult>}
     */
    async dropDatabase(execute) {
        return this.#hasDatabaseName(execute) ??
            await this.#hasDatabase(execute, true) ??
            {
                success: true
            };
    }

    /**
     * Check conditions for creating database
     * @param execute {Execute}
     * @return {Promise<SqlResult>}
     */
    async createDatabase(execute) {
        return this.#hasDatabaseName(execute) ??
            await this.#hasDatabase(execute, false) ??
            {
                success: true
            };
    }

    /**
     * Check conditions for creating table
     * @param execute {Execute}
     * @return {Promise<SqlResult>}
     */
    async createTable(execute) {
        return this.#hasDatabaseName(execute) ??
            this.#hasTableName(execute) ??
            this.#hasColumns(execute) ??
            await this.#hasTable(execute) ??
            {
                success: true
            };
    }

    /**
     * Check if database and table exists
     * @param execute {Execute}
     * @return {Promise<SqlResult>}
     */
    async dropTable(execute) {
        return this.#hasDatabaseName(execute) ??
            this.#hasTableName(execute) ??
            {
                success: true
            }
    }

    /**
     * Check conditions for creating columns
     * @param execute {Execute}
     * @return {Promise<SqlResult>}
     */
    async columns(execute) {
        return this.#hasDatabaseName(execute) ??
            this.#hasTableName(execute) ??
            this.#hasColumns(execute) ??
            {
                success: true
            };
    }

    /**
     * Checks if database name already exists
     * @param execute {Execute}
     * @param ignore {boolean}
     * @returns {Promise<SqlResult|null>}
     */
    async #hasDatabase(execute, ignore) {
        if (await mssql.databaseExists(execute.sql)) {
            if (!ignore) {
                return {
                    success: false,
                    operation: Operation.DatabaseExists
                }
            }

            return {
                success: false,
                operation: Operation.IgnoreDatabase
            };
        }

        return null;
    }

    /**
     * Checks conditions for creating table
     * @param execution {Execute}
     * @returns {Promise<SqlResult|null>}
     */
    async #hasTable(execution) {
        if (await mssql.tableExists(execution.sql)) {
            return {
                success: false,
                operation: Operation.TableExists
            }
        }

        return null;
    }

    /**
     * Checks if database property is set
     * @param executable {Execute}
     * @returns {SqlResult|null}
     */
    #hasDatabaseName(executable) {
        if (executable.sql?.database == null) {
            return {
                success: false,
                operation: Operation.NoDatabase
            }
        }

        return null;
    }

    /**
     * Checks if table property is set
     * @param execution {Execute}
     * @returns {SqlResult|null}
     */
    #hasTableName(execution) {
        if (execution.sql?.table == null) {
            return {
                success: false,
                operation: Operation.NoTable
            }
        }

        return null;
    }

    /**
     * Checks if column property is set
     * @param executable {Execute}
     * @returns {SqlResult|null}
     */
    #hasColumns(executable) {
        if (executable.sql?.columns == null) {
            return {
                success: false,
                operation: Operation.NoColumns
            }
        }

        return null;
    }
}

export class SqlResult {
    /**
     * @type {boolean}
     */
    success;

    /**
     * @type {string|null}
     */
    operation;
}

export const Operation = Object.freeze({NoColumns: 'no-columns', NoTable: 'no-table', NoDatabase: 'no-database', TableExists: 'table-exists', DatabaseExists: 'database-exists', IgnoreDatabase: 'ignore-database'});