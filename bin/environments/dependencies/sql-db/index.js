module.exports = {
    handle: handle
}

const mssql = require('../../../common/helper/mssql');

/**
 * Handler for sql-db dependencies
 * @param dependency {Dependency}
 * @param name {string}
 */
async function handle(dependency, name) {
    switch (dependency.database.option) {
        case "create-database":
            await createDatabase(dependency);
            break;
        default:
            console.error(`sql-db: option '${dependency.database.option}' not supported`);
    }
}

/**
 * Create database
 * @param dependency {Dependency}
 * @returns {Promise<void>}
 */
async function createDatabase(dependency) {
    if (await mssql.databaseExists(dependency.database.db_name)) {
        console.log(`sql-db: '${dependency.database.option} :: ${dependency.database.db_name}' has already been created`);
        return;
    }

    try {
        await mssql.createDatabase(dependency.database.db_name);
        console.log(`sql-db: '${dependency.database.option} :: ${dependency.database.db_name}' has been created`);
    } catch (e) {
        console.error(`sql-db: '${dependency.database.option} :: ${dependency.database.db_name}' has not been created`);
        throw e;
    }
}

