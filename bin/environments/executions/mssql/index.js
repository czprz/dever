const mssql = require('../../../common/helper/mssql');

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
        if (!execution.sql.database) {
            console.log(`mssql: '${execution.name}' could not find database name`);
            return;
        }

        if (await mssql.databaseExists(execution.sql)) {
            console.log(`mssql: '${execution.name}' :: database has already been created`);
            return;
        }

        try {
            await mssql.createDatabase(execution.sql);
            console.log(`mssql: '${execution.name}' :: database has been created`);
        } catch (e) {
            console.error(`mssql: '${execution.name}' :: database has not been created`);
            throw e;
        }
    }

    /**
     * Create table
     * @param execution {Execution}
     */
    async #createTable(execution) {
        if (!execution.sql.database || execution.sql.table) {
            console.log(`mssql: '${execution.name}' could not find database or table name`);
            return;
        }

        if (!await mssql.databaseExists(execution.sql)) {
            console.log(`mssql: '${execution.name}' :: could not create table due to the database '${execution.sql.database}' not existing`);
            return;
        }

        if (await mssql.tableExists(execution.sql)) {
            console.log(`mssql: '${execution.name}' :: table has already been created'`);
            return;
        }

        try {
            await mssql.createTable(execution.sql);
            console.log(`mssql: '${execution.name}' :: table has been created`);
        } catch (e) {
            console.error(`mssql: '${execution.name}' :: table has not been created`);
            throw e;
        }
    }

    /**
     * Checks and runs 'insert into' once or multiple times depending on whether it's a string or array
     * @param execution {Execution}
     * @returns {Promise<void>}
     */
    async #insert(execution) {
        if (!execution.sql.database || execution.sql.table) {
            console.log(`mssql: '${execution.name}' could not find database or table name`);
            return;
        }

        if (!await mssql.databaseExists(execution.sql)) {
            console.log(`mssql: '${name}' :: could not insert into '${execution.sql.database}' as the database was not found`);
            return;
        }

        if (!await mssql.tableExists(execution.sql)) {
            console.log(`mssql: '${name}' :: could not insert into '${execution.sql.table} as the table was not found`);
            return;
        }

        try {
            await mssql.insert(execution.sql);
            console.log(`mssql: '${name}' :: insert into has completed successfully`);
        } catch (e) {
            console.error(`mssql: '${name}' :: insert into could not complete successfully`);
            throw e;
        }
    }
}

