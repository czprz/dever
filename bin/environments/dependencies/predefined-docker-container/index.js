module.exports = {
    handle: handle,
    checkDependencies: checkDependencies
}

const docker = require('../../../common/helper/docker');

async function handle(dependency, args) {
    if (!docker.is_docker_running()) {
        console.error(`Could not interact with '${dependency.name}'. Docker engine not started.`);
        return;
    }

    if (args.start) {
        await start(dependency, args);
    }

    if (args.stop) {
        await stop(dependency);
    }
}

function checkDependencies() {
    if (!docker.is_docker_running()) {
        console.error(`Docker engine not running. Please start docker and retry command.`);
        return false;
    }

    return true;
}

async function start(dependency, args) {
    switch (dependency.name) {
        case "fake-wcf": {
            const fake_wcf = require('./fake-wcf');
            await fake_wcf.start(args);
            break;
        }
        case "fake-inventory": {
            const inventory = require('./inventory');
            await inventory.start(args);
            break;
        }
        case "mssql": {
            const mssql = require('./mssql');
            await mssql.start(args);
            break;
        }
        case "fake-nginx": {
            const fake_nginx = require('./nginx');
            await fake_nginx.start(args);
            break;
        }
        case "fake-wpmc": {
            const fake_wpmc = require('./wpmc');
            await fake_wpmc.start(args);
            break;
        }
    }
}

function stop(dependency) {
    switch (dependency.name) {
        case "fake-wcf": {
            const fake_wcf = require('./fake-wcf');
            fake_wcf.stop().catch(console.error);
            break;
        }
        case "fake-inventory": {
            const inventory = require('./inventory');
            inventory.stop();
            break;
        }
        case "mssql": {
            const mssql = require('./mssql');
            mssql.stop();
            break;
        }
        case "fake-nginx": {
            const fake_nginx = require('./nginx');
            fake_nginx.stop();
            break;
        }
        case "fake-wpmc": {
            const fake_wpmc = require('./wpmc');
            fake_wpmc.stop();
            break;
        }
    }
}
