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

        switch (execution.option) {
            case "create-database":
                await this.#createDatabase(execution);
                break;
            case "create-table":
                await this.#createTable(execution);
                break;
            case "insert-into":
                await this.#insertInto(execution);
                break;
            default:
                console.error(`mssql: option '${execution.option}' not supported`);
        }
    }

    /**
     * Create database
     * @param execution {Execution}
     * @returns {Promise<void>}
     */
    async #createDatabase(execution) {
        if (await mssql.databaseExists(execution.command)) {
            console.log(`mssql: '${execution.name}' :: database has already been created`);
            return;
        }

        try {
            await mssql.createDatabase(execution.command);
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
        const names = this.#getDatabaseAndTableNames(execution.command);
        if (names == null) {
            console.log(`mssql: '${execution.name}' could not find database or table names`);
            return;
        }

        if (!await mssql.databaseExists(names.databaseName)) {
            console.log(`mssql: '${execution.name}' :: could not create table due to the database '${names.databaseName}' not existing`);
            return;
        }

        if (await mssql.tableExists(names.databaseName, names.tableName)) {
            console.log(`mssql: '${execution.name}' :: table has already been created'`);
            return;
        }

        try {
            await mssql.createTable(execution.command);
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
    async #insertInto(execution) {
        if (Array.isArray(execution.command)) {
            for (const command of execution.command) {
                await this.#insertIntoRunner(command, execution.name);
            }
        } else {
            await this.#insertIntoRunner(execution.command, execution.name);
        }
    }

    /**
     * Runs insert into command if all criteria are valid
     * @param command {string}
     * @param name {string}
     * @returns {Promise<void>}
     */
    async #insertIntoRunner(command, name) {
        const names = this.#getDatabaseAndTableNames(command);
        if (names == null) {
            console.log(`mssql: '${name}' could not find database or table names`);
            return;
        }

        if (!await mssql.databaseExists(names.databaseName)) {
            console.log(`mssql: '${name}' :: could not insert into '${names.databaseName}' as the database was not found`);
            return;
        }

        if (!await mssql.tableExists(names.databaseName, names.tableName)) {
            console.log(`mssql: '${name}' :: could not insert into '${names.tableName} as the table was not found`);
            return;
        }

        try {
            await mssql.insertInto(command);
            console.log(`mssql: '${name}' :: insert into has completed successfully`);
        } catch (e) {
            console.error(`mssql: '${name}' :: insert into could not complete successfully`);
            throw e;
        }
    }

    /**
     * Gets database and table name from command
     * @param command {string}
     * @return { {databaseName: string, tableName: string} | null }
     */
    #getDatabaseAndTableNames(command) {
        if (command == null) {
            throw new Error('Missing command');
        }

        const matched = command.match(/([a-zA-Z0-9_-]+)\.dbo\.([a-zA-Z0-9_-]+)/i);
        if (matched == null) {
            return null;
        }

        return {databaseName: matched[1], tableName: matched[2]};
    }
}

