const readline = require("readline");
const chalk = require('chalk');

const sudo = require('../common/helper/elevated');
const delayer = require('../common/helper/delayer');
const customOption = require('../common/helper/custom_options');

const docker_compose = require('./executions/docker-compose');
const docker_container = require('./executions/docker-container');
const powershell_script = require('./executions/powershell-script');
const powershell_command = require('./executions/powershell-command');
const mssql = require('./executions/mssql');

module.exports = new class {
    /**
     * Handler for dependencies
     * @param config {Config}
     * @param yargs {object}
     * @param args {EnvArgs}
     * @returns {Promise<void>}
     */
    async handler(config, yargs, args) {
        const runtime = this.#getRuntime(args);
        if (runtime.start && runtime.stop) {
            console.error(chalk.redBright('You cannot defined both --start and --stop in the same command'));
            return;
        }

        switch (true) {
            case runtime.start:
            case runtime.stop:
                await this.#startOrStop(config, runtime);
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
            .option('not', {
                alias: 'n',
                describe: 'Include name of executions to avoid starting or stopping it'
            })
            .option('clean', {
                describe: `Usage '--start --clean' which will do a clean startup`
            })
            .option('s', {
                alias: 'skip',
                describe: 'Skip confirmation messages'
            });

        const customOptions = this.#getCustomOptions(config.environment);
        return customOption.addOptionsToYargs(options, customOptions);
    }

    /**
     * Handles handlers for each environment dependency
     * @param config {Config}
     * @param runtime {Runtime}
     * @returns {Promise<void>}
     */
    async #startOrStop(config, runtime) {
        const options = this.#getCustomOptions(config.environment);
        const result = customOption.validateOptions(runtime.args, options);
        if (!result.status) {
            console.error(result.message);
            return;
        }

        if (!this.#checkAvailabilityOfDependencies(config.environment)) {
            return;
        }

        if (!await this.#confirmRunningWithoutElevated(runtime.args.skip, config.environment)) {
            return;
        }

        for (const execution of config.environment) {
            if ((execution.runtime && runtime.variables.length > 0 && !runtime.variables.some(x => x === execution.name)) ||
                runtime.not.length > 0 && runtime.not.some(x => x === execution.name)) {
                continue;
            }

            await this.#hasWait(execution, 'before');

            switch (execution.type) {
                case "docker-compose":
                    docker_compose.handle(config, execution, runtime);
                    break;
                case "docker-container":
                    docker_container.handle(execution, runtime);
                    break;
                case "powershell-script":
                    await powershell_script.handle(config, execution, runtime);
                    break;
                case "powershell-command":
                    await powershell_command.handle(execution, runtime);
                    break;
                case "mssql":
                    await mssql.handle(execution, runtime);
                    break;
                default:
                    console.error(`"${execution.name}::${execution.type}" not found`);
            }

            await this.#hasWait(execution, 'after');
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
     * @param executions {Execution[]}
     * @return {CustomOption[]}
     */
    #getCustomOptions(executions) {
        const options = [];
        for (const execution of executions) {
            if (execution.options == null) {
                continue;
            }

            for (const option in execution.options) {
                options.push(execution.options[option]);
            }
        }

        return options;
    }

    /**
     * Creates promise which delays an await for defined period of time
     * @param execution {Execution}
     * @param timing {'after'|'before'}
     * @returns {Promise<unknown>}
     */
    #hasWait(execution, timing) {
        if (execution.wait == null) {
            return null;
        }

        if (execution.wait.when === timing) {
            return new Promise(resolve => setTimeout(resolve, execution.wait.time));
        }
    }

    /**
     * Check if confirmation message should be shown if some steps in dever.json needs to be elevated and shell is not run with elevated permissions
     * @param ignore {boolean}
     * @param executions {Execution[]}
     * @returns {Promise<boolean>}
     */
    async #confirmRunningWithoutElevated(ignore, executions) {
        if (ignore) {
            return true;
        }

        if (await sudo.isElevated()) {
            return true;
        }

        if (!this.#anyDependencyWhichNeedsElevatedPermissions(executions)) {
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
     * @param executions {Execution[]}
     * @return {boolean}
     */
    #anyDependencyWhichNeedsElevatedPermissions(executions) {
        for (const execution of executions) {
            if (execution.runAsElevated != null && execution.runAsElevated) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if dependency of dependency is available
     * @param executions {Execution[]}
     * @returns {boolean}
     */
    #checkAvailabilityOfDependencies(executions) {
        for (const execution of executions) {
            switch (execution.type) {
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

    /**
     *
     * @param args {EnvArgs}
     * @returns {Runtime}
     */
    #getRuntime(args) {
        const stop = args.hasOwnProperty('stop');
        const start = args.hasOwnProperty('start');

        if (stop === start) {
            return {
                start: start,
                stop: stop
            };
        }

        const choice = start ? 'start' : 'stop';

        return {
            start: start,
            stop: stop,
            variables: this.#getVariables(args[choice]),
            clean: args.hasOwnProperty('clean'),
            not: this.#getVariables(args.not),
            args: args
        };
    }

    /**
     * Properly format keys regardless of input
     * @param value {string|string[]}
     * @return {string[]}
     */
    #getVariables(value) {
        if (typeof value === 'boolean') {
            return [];
        }

        if (typeof value === 'string') {
            return value.split(',');
        }

        return value != null ? value : [];
    }
};

class Runtime {
    /**
     * Start option is true when set
     * @return {boolean}
     */
    start;

    /**
     * Stop option is true when set
     * @return {boolean}
     */
    stop;

    /**
     * Contains names of runtime executions user wants to start or stop
     * @return {string[]}
     */
    variables;

    /**
     * Is checked if user wants a clean start
     * @return {boolean}
     */
    clean;

    /**
     * List of execution names which should not be included in starting and stopping
     * @return {string[]}
     */
    not;

    /**
     * @return {EnvArgs}
     */
    args;
}

class EnvArgs {
    /**
     * Option for starting environment
     * @var {bool|string|string[]}
     */
    start;

    /**
     * Option for stopping environment
     * @var {boolean|string|string[]}
     */
    stop;

    /**
     * Option (optional) included with start for starting environment cleanly
     * @var {boolean}
     */
    clean;

    /**
     * List of execution names which should not be included in starting and stopping
     * @return {boolean|string|string[]}
     */
    not;

    /**
     * Component
     * @var {string}
     */
    keyword;

    /**
     * Skip warnings (typically used together with --start, if e.g. something needs to be elevated but you actually don't need it)
     * @return {boolean}
     */
    skip;
}
