import mssql from '../../../common/helper/mssql/index.js';
import {Execute} from "../../../execution/executor/action-mapper.js";
import {Status} from "../../executor/models.js";

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
            new SqlResult(Condition.Success);
    }

    /**
     * Check conditions for creating database
     * @param execute {Execute}
     * @return {Promise<SqlResult>}
     */
    async createDatabase(execute) {
        return this.#hasDatabaseName(execute) ??
            await this.#hasDatabase(execute, false) ??
            new SqlResult(Condition.Success);
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
            new SqlResult(Condition.Success);
    }

    /**
     * Check if database and table exists
     * @param execute {Execute}
     * @return {Promise<SqlResult>}
     */
    async dropTable(execute) {
        return this.#hasDatabaseName(execute) ??
            this.#hasTableName(execute) ??
            new SqlResult(Condition.Success);
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
            new SqlResult(Condition.Success);
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
                return new SqlResult(Condition.Warning, Operation.DatabaseExists);
            }

            return new SqlResult(Condition.Success, Operation.IgnoreDatabase);
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
            return new SqlResult(Condition.Warning, Operation.TableExists);
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
            return new SqlResult(Condition.Error, Operation.NoDatabase);
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
            return new SqlResult(Condition.Error, Operation.NoTable);
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
            return new SqlResult(Condition.Error, Operation.NoColumns);

        }

        return null;
    }
}

export class SqlResult {
    /**
     * @type {number}
     */
    condition;

    /**
     * @type {string|null}
     */
    operation;

    constructor(condition, operation = null) {
        this.condition = condition;
        this.operation = operation;
    }

    /**
     * Get status from condition
     * @return {Status}
     */
    getStatus() {
        switch (this.condition) {
            case Condition.Success:
                return Status.Success;
            case Condition.Warning:
                return Status.Warning;
            case Condition.Error:
                return Status.Error;
            default:
                throw new Error('Unknown condition');
        }
    }
}

export const Condition = Object.freeze({Success: 0, Warning: 1, Error: 2});

export const Operation = Object.freeze({NoColumns: 'no-columns', NoTable: 'no-table', NoDatabase: 'no-database', TableExists: 'table-exists', DatabaseExists: 'database-exists', IgnoreDatabase: 'ignore-database'});