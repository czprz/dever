import mssql from '../../../helper/mssql/index.js';
import validator, {Operation as ValidatorOperation} from '../../../helper/mssql/validator.js';

import {Execute} from '../../../../execution/executor/action-mapper.js';
import {ExecutionInterface, ExecutionLog} from "../../models.js";

"use strict";
export default new class extends ExecutionInterface {
    /**
     * Execution type
     * @type {string}
     * @private
     */
    _type = 'mssql';

    /**
     * Check dependencies for mssql execution
     */
    check() {
        return this._success(Operation.DependencyCheck, true);
    }

    /**
     * Executes sql
     */
    async _execute(execute, runtime) {
        switch (execute.sql.option) {
            case "create-database":
                await this.#createDatabase(execute);
                break;
            case "drop-database":
                await this.#dropDatabase(execute);
                break;
            case "create-table":
                await this.#createTable(execute);
                break;
            case "insert":
                await this.#insert(execute);
                break;
            default:
                this._error(Operation.NotSupported);
                break;
        }
    }

    /**
     * Create database
     * @param execute {Execute}
     * @returns {Promise<ExecutionLog>}
     */
    async #createDatabase(execute) {
        try {
            const result = await validator.createDatabase(execute);
            if (!result.success) {
                return this._error(result.operation);
            }

            await mssql.createDatabase(execute.sql);

            return this._success(Operation.DatabaseCreated);
        } catch (e) {
            return this._error(Operation.NotDatabaseCreated, e);
        }
    }

    /**
     * Create table
     * @param execute {Execute}
     * @returns {Promise<ExecutionLog>}
     */
    async #createTable(execute) {
        try {
            const result = await validator.createTable(execute);
            if (!result.success) {
                return this._error(result.operation);
            }

            await mssql.createTable(execute.sql);

            return this._success(Operation.TableCreated);
        } catch (e) {
            return this._error(Operation.NotTableCreated, e);
        }
    }

    /**
     * Checks and runs 'insert into' once or multiple times depending on whether it's a string or array
     * @param execute {Execute}
     * @returns {Promise<ExecutionLog>}
     */
    async #insert(execute) {
        try {
            const result = await validator.columns(execute);
            if (!result.success) {
                return this._error(result.operation);
            }

            await mssql.insert(execute.sql);

            return this._success(Operation.Inserted);
        } catch (e) {
            return this._error(Operation.NotInserted, e);
        }
    }

    /**
     * Drops database
     * @param execute {Execute}
     * @return {Promise<ExecutionLog>}
     */
    async #dropDatabase(execute) {
        try {
            const result = await validator.dropDatabase(execute);
            if (result.success) {
                return this._error(result.operation);
            }

            await mssql.dropDatabase(execute.sql);

            return this._success(Operation.DatabaseDropped);
        } catch (e) {
            return this._error(Operation.NotDatabaseDropped, e);
        }
    }
}

export const Operation = Object.freeze({
    ...ValidatorOperation,
    DatabaseCreated: 'database-created',
    NotDatabaseCreated: 'not-database-created',
    DatabaseDropped: 'database-dropped',
    NotDatabaseDropped: 'not-database-dropped',
    TableCreated: 'table-created',
    NotTableCreated: 'not-table-created',
    TableDropped: 'table-dropped',
    Inserted: 'inserted',
    NotInserted: 'not-insert',
    NotSupported: 'not-supported',
    DependencyCheck: 'dependency-check'
});