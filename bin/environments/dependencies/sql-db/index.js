module.exports = {
    handle: handle
}

const mssql = require('../../../common/helper/mssql');

/**
 * Handler for mssql dependencies
 * @param dependency {Dependency}
 * @param args {Args}
 * @param name {string}
 */
async function handle(dependency, args, name) {
    if (args.stop) {
        return;
    }

    switch (dependency.option) {
        case "create-database":
            await createDatabase(dependency, name);
            break;
        case "create-table":
            await createTable(dependency, name);
            break;
        case "insert-into":
            await insertInto(dependency, name);
            break;
        default:
            console.error(`mssql: option '${dependency.option}' not supported`);
    }
}

/**
 * Create database
 * @param dependency {Dependency}
 * @param name {string}
 * @returns {Promise<void>}
 */
async function createDatabase(dependency, name) {
    if (await mssql.databaseExists(dependency.command)) {
        console.log(`mssql: '${name}' :: database has already been created`);
        return;
    }

    try {
        await mssql.createDatabase(dependency.command);
        console.log(`mssql: '${name}' :: database has been created`);
    } catch (e) {
        console.error(`mssql: '${name}' :: database has not been created`);
        throw e;
    }
}

async function createTable(dependency, name) {
    const names = getDatabaseAndTableNames(dependency.command);
    if (names == null) {
        console.log(`mssql: '${name}' could not find database or table names`);
        return;
    }

    if (!await mssql.databaseExists(names.databaseName)) {
        console.log(`mssql: '${name}' :: could not create table due to the database '${names.databaseName}' not existing`);
        return;
    }

    if (await mssql.tableExists(names.databaseName, names.tableName)) {
        console.log(`mssql: '${name}' :: table has already been created'`);
        return;
    }

    try {
        await mssql.createTable(dependency.command);
        console.log(`mssql: '${name}' :: table has been created`);
    } catch (e) {
        console.error(`mssql: '${name}' :: table has not been created`);
        throw e;
    }
}

/**
 * Checks and runs 'insert into' once or multiple times depending on whether it's a string or array
 * @param dependency {Dependency}
 * @param name {string}
 * @returns {Promise<void>}
 */
async function insertInto(dependency, name) {
    if (Array.isArray(dependency.command)) {
        for (const command of dependency.command) {
            await insertIntoRunner(command, name);
        }
    } else {
        await insertIntoRunner(dependency.command, name);
    }
}

/**
 * Runs insert into command if all criteria are valid
 * @param command {string}
 * @param name {string}
 * @returns {Promise<void>}
 */
async function insertIntoRunner(command, name) {
    const names = getDatabaseAndTableNames(command);
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
 * @return { {databaseName: string, tableName: string} }
 */
function getDatabaseAndTableNames(command) {
    if (command == null) {
        return;
    }

    const matched = command.match(/([a-zA-Z0-9_-]+)\.dbo\.([a-zA-Z0-9_-]+)/i);
    if (matched == null) {
        return null;
    }

    return {databaseName: matched[1], tableName: matched[2]};
}

