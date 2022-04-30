const mssql = require('../../../common/helper/mssql');
const validator = require('../../../common/helper/mssql/validator');
const logger = require('../../../common/helper/logger');

"use strict";
module.exports = new class {
    /**
     * Handler for mssql dependencies
     * @param execution {Execution}
     * @param runtime {Runtime}
     */
    async handle(execution, runtime) {
        if (runtime.stop) {
            return;
        }

        switch (execution.sql.option) {
            case "create-database":
                await this.#createDatabase(execution);
                break;
            case "create-table":
                await this.#createTable(execution);
                break;
            case "insert":
                await this.#insert(execution);
                break;
            default:
                console.error(`mssql: option '${execution.sql.option}' not supported`);
        }
    }

    /**
     * Create database
     * @param execution {Execution}
     * @returns {Promise<void>}
     */
    async #createDatabase(execution) {
        try {
            if (!await validator.createDatabase(execution)) {
                return;
            }

            await mssql.createDatabase(execution.sql);
            console.log(`mssql: '${execution.name}' :: database has been created`);
        } catch (e) {
            logger.error(`mssql: '${execution.name}' :: database has not been created`, e);
        }
    }

    /**
     * Create table
     * @param execution {Execution}
     */
    async #createTable(execution) {
        try {
            if (!await validator.createTable(execution)) {
                return;
            }

            await mssql.createTable(execution.sql);
            console.log(`mssql: '${execution.name}' :: table has been created`);
        } catch (e) {
            logger.error(`mssql: '${execution.name}' :: table has not been created`, e);
        }
    }

    /**
     * Checks and runs 'insert into' once or multiple times depending on whether it's a string or array
     * @param execution {Execution}
     * @returns {Promise<void>}
     */
    async #insert(execution) {
        try {
            if (!await validator.columns(execution)) {
                return;
            }

            await mssql.insert(execution.sql);
            console.log(`mssql: '${execution.name}' :: inserting of data has completed successfully`);
        } catch (e) {
            logger.error(`mssql: '${execution.name}' :: inserting of data could not be completed`, e);
        }
    }
}

