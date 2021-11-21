const readline = require("readline");
const chalk = require('chalk');

const config_handler = require('../configuration/handleConfigFile');
const sudo = require('../common/helper/elevated');
const delayer = require('../common/helper/delayer');
const customOption = require('../common/helper/custom_options');

const docker_compose = require('./dependencies/docker-compose');
const docker_container = require('./dependencies/docker-container');
const powershell_script = require('./dependencies/powershell-script');
const powershell_command = require('./dependencies/powershell-command');
const mssql = require('./dependencies/mssql');

const components_handler = require('../configuration/handleComponents');

module.exports = new class {
    /**
     * Handler for dependencies
     * @param yargs {object}
     * @param args {Args}
     * @returns {Promise<void>}
     */
    async handler(yargs, args) {
        switch (true) {
            case args.start:
            case args.stop:
                await this.#startOrStop(args);
                break;
            case args.config:
                this.#showConfig(args.component);
                break;
            case args.list:
                this.#listAllComponents();
                break;
            case args.location:
                this.#showLocation(args.component);
                break;
            default:
                this.#showHelp(yargs);
        }
    }

    /**
     * Generate default or component options
     * @param yargs
     * @returns {*|Object}
     */
    getOptions(yargs) {
        const keyword = this.#getKeywordFromArgv(yargs.argv);
        return keyword == null ?
            this.#optionsWithoutComponent(yargs) :
            this.#optionsWithComponent(yargs, keyword);
    }

    /**
     * Handles handlers for each environment dependency
     * @param args {Args}
     * @returns {Promise<void>}
     */
    async #startOrStop(args) {
        const keyword = args.component != null ? args.component.toLowerCase() : null;

        if (keyword == null) {
            console.error(`Must have a component keyword. Please attempt with ${chalk.blue('dever env [component]')}`);
            return;
        }

        if (!args.start && !args.stop) {
            console.error(`Missing key option. Must have one of either ${chalk.green('--start')} or ${chalk.green('--stop')} defined`);
            return;
        }

        const component = components_handler.getComponent(keyword);
        if (component == null) {
            console.log('Could not find component');
            return;
        }

        const options = this.#getCustomOptions(component.dependencies);
        const result = customOption.validateOptions(args, options);
        if (!result.status) {
            console.error(result.message);
            return;
        }

        if (!this.#checkAvailabilityOfDependencies(component.dependencies)) {
            return;
        }

        if (!await this.#confirmRunningWithoutElevated(args.ignore, component.dependencies)) {
            return;
        }

        for (const name in component.dependencies) {
            if (!component.dependencies.hasOwnProperty(name)) {
                throw Error(`Property '${name}' not found`);
            }

            const dependency = component.dependencies[name];

            await this.#hasWait(dependency, 'before');

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
                case "mssql":
                    await mssql.handle(dependency, args, name);
                    break;
                default:
                    console.error(`"${name}::${dependency.type}" not found`);
            }

            await this.#hasWait(dependency, 'after');
        }
    }

    /**
     * Show location of the components configuration file
     * @param keyword {string}
     */
    #showLocation(keyword) {
        if (keyword == null) {
            console.error(`Missing [component]. Please try again with ${chalk.green('dever env [component] --location')}`);
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
     * Show configuration for a specific component
     * @param keyword {string}
     */
    #showConfig(keyword) {
        let config;

        if (keyword == null) {
            config = config_handler.get();
        } else {
            config = components_handler.getComponent(keyword);
        }

        if (config == null) {
            console.error(chalk.redBright(keyword == null ? 'Could not find dever configuration' : 'Could not find component'));
            return;
        }

        console.log(config);
    }

    /**
     * Shows a list of found components in the console
     */
    #listAllComponents() {
        const components = components_handler.getAllComponents();
        if (components == null || components.length === 0) {
            console.error(`could not find any components. Please try running ${chalk.green('dever init')}`);
            return;
        }

        console.log(`List of all components found after last ${chalk.green('dever init')} scan`);

        for (const component of components) {
            console.log(`${chalk.blue(component.component)} - ${chalk.green(component.keywords)}`);
        }
    }

    /**
     * Show help context menu when called
     * @param yargs
     * @return void
     */
    #showHelp(yargs) {
        yargs.showHelp();
    }

    /**
     * Get all options without component
     * @param yargs {object}
     * @returns {object}
     */
    #optionsWithoutComponent(yargs) {
        return yargs
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
    }

    /**
     * Get all component options
     * @param yargs {object}
     * @param keyword {string}
     * @returns {object}
     */
    #optionsWithComponent(yargs, keyword) {
        const component = components_handler.getComponent(keyword);
        if (component == null) {
            return null;
        }

        const options = yargs
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

        const customOptions = this.#getCustomOptions(component.dependencies);
        return customOption.addOptionsToYargs(options, customOptions);
    }

    /**
     * Get all custom options from dependencies
     * @param dependencies {Dependency[]}
     * @return {CustomOption[]}
     */
    #getCustomOptions(dependencies) {
        const options = [];
        for (const key in dependencies) {
            if (dependencies[key].options == null) {
                continue;
            }

            for (const option in dependencies[key].options) {
                options.push(dependencies[key].options[option]);
            }
        }

        return options;
    }

    /**
     * Get keyword from yargs
     * @param argv {object}
     * @returns {null|*}
     */
    #getKeywordFromArgv(argv) {
        if (argv.length < 2) {
            return null;
        }

        return argv._[1];
    }

    /**
     * Creates promise which delays an await for defined period of time
     * @param dependency {Dependency}
     * @param timing {'after'|'before'}
     * @returns {Promise<unknown>}
     */
    #hasWait(dependency, timing) {
        if (dependency.wait == null) {
            return null;
        }

        if (dependency.wait.when === timing) {
            return new Promise(resolve => setTimeout(resolve, dependency.wait.time));
        }
    }

    /**
     * Check if confirmation message should be shown if some steps in dever.json needs to be elevated and shell is not run with elevated permissions
     * @param ignore {boolean}
     * @param dependencies {Dependency[]}
     * @returns {Promise<boolean>}
     */
    async #confirmRunningWithoutElevated(ignore, dependencies) {
        if (ignore) {
            return true;
        }

        if (await sudo.isElevated()) {
            return true;
        }

        if (!this.#anyDependencyWhichNeedsElevatedPermissions(dependencies)) {
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
    #anyDependencyWhichNeedsElevatedPermissions(dependencies) {
        for (const name in dependencies) {
            const dependency = dependencies[name];
            if (dependency != null && dependency.runAsElevated) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if dependency of dependency is available
     * @param dependencies {Dependency[]}
     * @returns {boolean}
     */
    #checkAvailabilityOfDependencies(dependencies) {
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
};

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

    /**
     * Show command/file that will be executed when running 'fix [problem]' command
     * @return {boolean}
     */
    show;
}
