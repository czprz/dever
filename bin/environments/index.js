const readline = require("readline");
const chalk = require('chalk');

const sudo = require('../common/helper/elevated');
const delayer = require('../common/helper/delayer');
const customOption = require('../common/helper/custom_options');

const docker_compose = require('./dependencies/docker-compose');
const docker_container = require('./dependencies/docker-container');
const powershell_script = require('./dependencies/powershell-script');
const powershell_command = require('./dependencies/powershell-command');
const mssql = require('./dependencies/mssql');

module.exports = new class {
    /**
     * Handler for dependencies
     * @param config {Config}
     * @param yargs {object}
     * @param args {EnvArgs}
     * @returns {Promise<void>}
     */
    async handler(config, yargs, args) {
        switch (true) {
            case args.start:
            case args.stop:
                await this.#startOrStop(config, args);
                break;
            default:
                this.#showHelp(yargs);
        }
    }

    /**
     * Generate default or component options
     * @param yargs {object}
     * @param config {Config}
     * @returns {*|Object}
     */
    getOptions(yargs, config) {
        const options = yargs
            .positional('keyword', {
                describe: 'Keyword for component',
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
            });

        const customOptions = this.#getCustomOptions(config.dependencies);
        return customOption.addOptionsToYargs(options, customOptions);
    }

    /**
     * Handles handlers for each environment dependency
     * @param config {Config}
     * @param args {EnvArgs}
     * @returns {Promise<void>}
     */
    async #startOrStop(config, args) {
        const options = this.#getCustomOptions(config.dependencies);
        const result = customOption.validateOptions(args, options);
        if (!result.status) {
            console.error(result.message);
            return;
        }

        if (!this.#checkAvailabilityOfDependencies(config.dependencies)) {
            return;
        }

        if (!await this.#confirmRunningWithoutElevated(args.ignore, config.dependencies)) {
            return;
        }

        for (const name in config.dependencies) {
            if (!config.dependencies.hasOwnProperty(name)) {
                throw Error(`Property '${name}' not found`);
            }

            const dependency = config.dependencies[name];

            await this.#hasWait(dependency, 'before');

            switch (dependency.type) {
                case "docker-compose":
                    docker_compose.handle(config, dependency, args, name);
                    break;
                case "docker-container":
                    docker_container.handle(dependency, args);
                    break;
                case "powershell-script":
                    await powershell_script.handle(config, dependency, args, name);
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
     * Show help context menu when called
     * @param yargs
     * @return void
     */
    #showHelp(yargs) {
        yargs.showHelp();
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
                    return docker_container.check();
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

class EnvArgs {
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
     * Component
     * @var {string}
     */
    keyword;

    /**
     * Ignore warnings (typically used together with --start, if e.g. something needs to be elevated but you actually don't need it)
     * @return {boolean}
     */
    ignore;
}
