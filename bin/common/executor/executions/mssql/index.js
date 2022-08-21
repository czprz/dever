import mssql from '../../../helper/mssql/index.js';
import validator from '../../../helper/mssql/validator.js';

import {Execute} from '../../../../new_executor/action-mapper.js';
import {ExecutionInterface, Result} from "../../models.js";

"use strict";
export default new class extends ExecutionInterface {
    /**
     * Execution type
     * @type {string}
     * @private
     */
    _type = 'mssql';

    /**
     * Handler for mssql execution
     */
    async handle(execute, runtime) {
        switch (execute.sql.option) {
            case "create-database":
                return await this.#createDatabase(execute);
            case "drop-database":
                return await this.#dropDatabase(execute);
            case "create-table":
                return await this.#createTable(execute);
            case "insert":
                return await this.#insert(execute);
            default:
                return this._error(Operation.NotSupported);
        }
    }

    /**
     * Check dependencies for mssql execution
     */
    check() {
        return this._success(Operation.DependencyCheck);
    }

    /**
     * Create database
     * @param execute {Execute}
     * @returns {Promise<Result>}
     */
    async #createDatabase(execute) {
        try {
            if (!await validator.createDatabase(execute)) {
                return this._error(Operation.DatabaseAlreadyExists);
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
     * @returns {Promise<Result>}
     */
    async #createTable(execute) {
        try {
            if (!await validator.createTable(execute)) {
                return this._error(Operation.TableAlreadyExists);
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
     * @returns {Promise<Result>}
     */
    async #insert(execute) {
        try {
            if (!await validator.columns(execute)) {
                return this._error(Operation.TableOrColumnsNotFound);
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
     * @return {Promise<Result>}
     */
    async #dropDatabase(execute) {
        try {
            if (await validator.dropDatabase(execute)) {
                return this._error(Operation.DatabaseNotFound);
            }

            await mssql.dropDatabase(execute.sql);

            return this._success(Operation.DatabaseDropped);
        } catch (e) {
            return this._error(Operation.NotDatabaseDropped, e);
        }
    }
}

export const Operation = Object.freeze({DatabaseCreated: 'database-created', NotDatabaseCreated: 'not-database-created', DatabaseDropped: 'database-dropped', NotDatabaseDropped: 'not-database-dropped', TableCreated: 'table-created', NotTableCreated: 'not-table-created', TableDropped: 'table-dropped', Inserted: 'inserted', NotInserted: 'not-insert', TableOrColumnsNotFound: 'columns-not-found', DatabaseAlreadyExists: 'database-already-exists', DatabaseNotFound: 'database-not-found', TableAlreadyExists: 'table-already-exists', NotSupported: 'not-supported', DependencyCheck: 'dependency-check'});

