import mssql from '../../../helper/mssql/index.js';
import validator, {Operation as ValidatorOperation} from '../../../helper/mssql/validator.js';

import {Execute} from '../../../../execution/executor/action-mapper.js';
import {ExecutionInterface} from "../../models.js";

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
     * @returns {Promise<void>}
     */
    async #createDatabase(execute) {
        try {
            this._started(Operation.DatabaseCreating);


            const result = await validator.createDatabase(execute);
            if (!result.success) {
                this._error(result.operation);
                return;
            }

            await mssql.createDatabase(execute.sql);

            this._success(Operation.DatabaseCreated);
        } catch (e) {
            this._error(Operation.NotDatabaseCreated, e);
        }
    }

    /**
     * Create table
     * @param execute {Execute}
     */
    async #createTable(execute) {
        try {
            this._started(Operation.TableCreating);

            const result = await validator.createTable(execute);
            if (!result.success) {
                this._error(result.operation);
                return;
            }

            await mssql.createTable(execute.sql);

            this._success(Operation.TableCreated);
        } catch (e) {
            this._error(Operation.NotTableCreated, e);
        }
    }

    /**
     * Checks and runs 'insert into' once or multiple times depending on whether it's a string or array
     * @param execute {Execute}
     */
    async #insert(execute) {
        try {
            this._started(Operation.Inserting);

            const result = await validator.columns(execute);
            if (!result.success) {
                this._error(result.operation);
                return;
            }

            await mssql.insert(execute.sql);

            this._success(Operation.Inserted);
        } catch (e) {
            this._error(Operation.NotInserted, e);
        }
    }

    /**
     * Drops database
     * @param execute {Execute}
     */
    async #dropDatabase(execute) {
        try {
            this._started(Operation.DatabaseDropping);

            const result = await validator.dropDatabase(execute);
            if (result.success) {
                this._error(result.operation);
                return;
            }

            await mssql.dropDatabase(execute.sql);

            this._success(Operation.DatabaseDropped);
        } catch (e) {
            this._error(Operation.NotDatabaseDropped, e);
        }
    }
}

export const Operation = Object.freeze({
    ...ValidatorOperation,
    DatabaseCreating: 'database-creating',
    DatabaseCreated: 'database-created',
    NotDatabaseCreated: 'not-database-created',
    DatabaseDropping: 'database-dropping',
    DatabaseDropped: 'database-dropped',
    NotDatabaseDropped: 'not-database-dropped',
    TableCreating: 'table-creating',
    TableCreated: 'table-created',
    NotTableCreated: 'not-table-created',
    TableDropping: 'table-dropping',
    TableDropped: 'table-dropped',
    Inserting: 'inserting',
    Inserted: 'inserted',
    NotInserted: 'not-insert',
    NotSupported: 'not-supported',
    DependencyCheck: 'dependency-check'
});