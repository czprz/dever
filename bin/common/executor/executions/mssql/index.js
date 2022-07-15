import mssql from '../../../helper/mssql/index.js';
import validator from '../../../helper/mssql/validator.js';

import {Execute, Runtime} from '../../../models/dever-json/internal.js';
import {ExecutionResult, Status} from "../../models.js";

"use strict";
export default new class {
    /**
     * Handler for mssql dependencies
     * @param execute {Execute}
     * @param runtime {Runtime}
     * @returns {Promise<ExecutionResult>}
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
                return new ExecutionResult(Status.Error, Operation.NotSupported);
        }
    }

    /**
     * Create database
     * @param execute {Execute}
     * @returns {Promise<ExecutionResult>}
     */
    async #createDatabase(execute) {
        try {
            if (!await validator.createDatabase(execute)) {
                return new ExecutionResult(Status.Error, Operation.DatabaseAlreadyExists);
            }

            await mssql.createDatabase(execute.sql);

            return new ExecutionResult(Status.Success, Operation.DatabaseCreated);
        } catch (e) {
            return new ExecutionResult(Status.Error, Operation.DatabaseCreated, e);
        }
    }

    /**
     * Create table
     * @param execute {Execute}
     * @returns {Promise<ExecutionResult>}
     */
    async #createTable(execute) {
        try {
            if (!await validator.createTable(execute)) {
                return new ExecutionResult(Status.Error, Operation.TableAlreadyExists);
            }

            await mssql.createTable(execute.sql);

            return new ExecutionResult(Status.Success, Operation.TableCreated);
        } catch (e) {
            return new ExecutionResult(Status.Error, Operation.TableCreated, e);
        }
    }

    /**
     * Checks and runs 'insert into' once or multiple times depending on whether it's a string or array
     * @param execute {Execute}
     * @returns {Promise<ExecutionResult>}
     */
    async #insert(execute) {
        try {
            if (!await validator.columns(execute)) {
                return new ExecutionResult(Status.Error, Operation.TableOrColumnsNotFound);
            }

            await mssql.insert(execute.sql);

            return new ExecutionResult(Status.Success, Operation.Inserted);
        } catch (e) {
            return new ExecutionResult(Status.Error, Operation.Inserted, e);
        }
    }

    /**
     * Drops database
     * @param execute {Execute}
     * @return {Promise<ExecutionResult>}
     */
    async #dropDatabase(execute) {
        try {
            if (await validator.dropDatabase(execute)) {
                return new ExecutionResult(Status.Error, Operation.DatabaseNotFound);
            }

            await mssql.dropDatabase(execute.sql);

            return new ExecutionResult(Status.Success, Operation.DatabaseDropped);
        } catch (e) {
            return new ExecutionResult(Status.Error, Operation.DatabaseDropped, e);
        }
    }
}

export const Operation = Object.freeze({DatabaseCreated: 'database-created', DatabaseDropped: 'database-dropped', TableCreated: 'table-created', TableDropped: 'table-dropped', Inserted: 'inserted', TableOrColumnsNotFound: 'columns-not-found', DatabaseAlreadyExists: 'database-already-exists', DatabaseNotFound: 'database-not-found', TableAlreadyExists: 'table-already-exists', NotSupported: 'not-supported'});

