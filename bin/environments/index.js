module.exports = {
    builder: builder,
    handler: handler
};

const chalk = require('chalk');

const config_handler = require('../configuration/handleConfigFile');
const sudo = require('../common/helper/elevated');
const delayer = require('../common/helper/delayer');

const docker_compose = require('./dependencies/docker-compose');
const docker_container = require('./dependencies/docker-container');
const powershell_script = require('./dependencies/powershell-script');
const powershell_command = require('./dependencies/powershell-command');
const sql_db = require('./dependencies/sql-db');

const components_handler = require('../configuration/handleComponents');
const readline = require("readline");

let env_options;

function builder(yargs) {
    const keyword = get_keyword(yargs.argv);
    return keyword == null ? handler_without_component(yargs) : handler_with_component(yargs);
}

/**
 * Handler for dependencies
 * @param args {Args}
 * @returns {Promise<void>}
 */
async function handler(args) {
    switch (true) {
        case args.start:
        case args.stop:
            await startOrStop(args);
            break;
        case args.config:
            showConfig(args.component);
            break;
        case args.list:
            listAllComponents();
            break;
        case args.location:
            showLocation(args.component);
            break;
        default:
            env_options.showHelp();
    }
}

function hasWait(dependency, timing) {
    if (dependency.wait == null) {
        return;
    }

    if (dependency.wait.when === timing) {
        return new Promise(resolve => setTimeout(resolve, dependency.wait.time));
    }
}

/**
 * Handles handlers for each environment dependency
 * @param args {Args}
 * @returns {Promise<void>}
 */
async function startOrStop(args) {
    const keyword = args.component != null ? args.component.toLowerCase() : null;

    if (keyword == null) {
        console.error(`Must have a component keyword. Please attempt with 'dever env [component]'`);
        return;
    }

    if (!args.start && !args.stop) {
        console.error('Missing flag. Must have one of either --start or --stop');
        return;
    }

    const component = components_handler.getComponent(keyword);
    if (component == null) {
        console.log('Could not find component');
        return;
    }

    if (!checkAvailabilityOfDependencies(component.dependencies)) {
        return;
    }

    if (!await confirmRunningWithoutElevated(args.ignore, component.dependencies)) {
        return;
    }

    for (const name in component.dependencies) {
        if (!component.dependencies.hasOwnProperty(name)) {
            throw Error(`Property '${name}' not found`);
        }

        const dependency = component.dependencies[name];

        await hasWait(dependency, 'before');

        switch (dependency.type) {
            case "docker-compose":
                docker_compose.handle(component, dependency, args, name);
                break;
            case "docker-container":
                docker_container.handle(dependency, args);
                break;
            case "powershell-script":
                await powershell_script.handle(component, dependency, args, name);
                break;
            case "powershell-command":
                await powershell_command.handle(dependency, args, name);
                break;
            case "sql-db":
                await sql_db.handle(dependency, args, name);
                break;
            default:
                console.error(`"${name}::${dependency.type}" not found`);
        }

        await hasWait(dependency, 'after');
    }
}

function showConfig(keyword) {
    let config;

    if (keyword == null) {
        config = config_handler.get();
    } else {
        config = components_handler.getComponent(keyword);
    }

    if (config == null) {
        console.error(keyword == null ? 'Could not find main configuration file' : 'Could not find component');
        return;
    }

    console.log(config);
}

function listAllComponents() {
    const components = components_handler.getAllComponents();
    if (components == null || components.length === 0) {
        console.error(`Could not find any components. Please try running 'dever init'`);
        return;
    }

    for (const component of components) {
        console.log('');
        console.log(`Component: ${component.component}`);
        console.log(`Keywords: ${component.keywords}`);
    }
}

function showLocation(keyword) {
    if (keyword == null) {
        console.error(`Missing component. Please try again with component. 'dever env [component] --location'`);
        return;
    }

    const component = components_handler.getComponent(keyword);
    if (component == null) {
        console.error('Could not find component');
        return;
    }

    console.log(component.location);
}

/**
 * Check if confirmation message should be shown if some steps in dever.json needs to be elevated and shell is not run with elevated permissions
 * @param ignore {boolean}
 * @param dependencies {Dependency[]}
 * @returns {Promise<boolean>}
 */
async function confirmRunningWithoutElevated(ignore, dependencies) {
    if (ignore) {
        return true;
    }

    if (await sudo.isElevated()) {
        return true;
    }

    if (!anyDependencyWhichNeedsElevatedPermissions(dependencies)) {
        return true;
    }

    console.log(chalk.redBright('There is one or more dependencies which needs elevated permissions.'));
    console.log(chalk.redBright(`It's recommended to run this command again with a terminal started with elevated permissions.`));
    console.log();

    const timer = delayer.create();

    const rl = readline.createInterface(process.stdin, process.stdout);
    await rl.question('Are you sure you want to continue? [yes]/no:', async (answer) => {
        if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
            timer.done(true);
        } else {
            timer.done(false);
        }

        rl.close();
    });

    return timer.delay(36000000, false);
}

/**
 * Check if any dependencies wants to run with elevated permissions
 * @param dependencies {Dependency[]}
 * @return {boolean}
 */
function anyDependencyWhichNeedsElevatedPermissions(dependencies) {
    for (const name in dependencies) {
        const dependency = dependencies[name];
        if (dependency != null && dependency.runAsElevated) {
            return true;
        }
    }

    return false;
}

function checkAvailabilityOfDependencies(dependencies) {
    for (let v in dependencies) {
        if (!dependencies.hasOwnProperty(v)) {
            throw Error(`Property '${v}' not found`);
        }

        const dependency = dependencies[v];

        switch (dependency.type) {
            case "docker-compose":
                return docker_compose.check();
            case "docker-container":
            case "run-command":
            case "powershell-script":
            case "powershell-command":
            default:
                break;
        }
    }

    return true;
}

function handler_with_component(yargs) {
    env_options = yargs
        .positional('component', {
            describe: 'Name of component to start or stop',
            type: 'string'
        })
        .option('start', {
            describe: 'Start component dependencies',
        })
        .option('stop', {
            describe: 'Stop component dependencies'
        })
        .option('t', {
            alias: 'turbines',
            describe: 'Number of turbines added to inventory'
        })
        .option('clean', {
            describe: `Usage '--start --clean' which will do a clean startup`
        })
        .option('i', {
            alias: 'ignore',
            describe: 'ignore confirmation messages'
        })
        .option('location', {
            describe: 'Show component location'
        })
        .option('c', {
            alias: 'config',
            describe: 'Show component configuration'
        });

    return env_options;
}

function handler_without_component(yargs) {
    env_options = yargs
        .positional('component', {
            describe: 'Keyword for component',
            type: 'string'
        })
        .option('l', {
            alias: 'list',
            describe: 'List all components'
        })
        .option('c', {
            alias: 'config',
            describe: 'Show dever configuration'
        });
    return env_options;
}

function get_keyword(argv) {
    if (argv.length < 2) {
        return null;
    }

    return argv._[1];
}

class Args {
    /**
     * Option for starting environment
     * @var {bool}
     */
    start;

    /**
     * Option for stopping environment
     * @var {bool}
     */
    stop;

    /**
     * Option (optional) included with start for starting environment cleanly
     * @var {boolean}
     */
    clean;

    /**
     * Number of turbines added to inventory
     * @var {number}
     */
    turbines;

    /**
     * Show dever or component configuration
     * @var {bool}
     */
    config;

    /**
     * Component
     * @var {string}
     */
    component;

    /**
     * How component location
     * @var {bool}
     */
    location;

    /**
     * Show list of components
     * @var {bool}
     */
    list;

    /**
     * Ignore warnings (typically used together with --start, if e.g. something needs to be elevated but you actually don't need it)
     * @return {boolean}
     */
    ignore;
}
