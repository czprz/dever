import docker_compose from './executions/docker-compose/index.js';
import docker_container from './executions/docker-container/index.js';
import powershell_script from './executions/powershell-script/index.js';
import powershell_command from './executions/powershell-command/index.js';
import mssql from './executions/mssql/index.js';

import sudo from '../common/helper/elevated.js';
import delayer from '../common/helper/delayer.js';
import customOption from '../common/helper/custom_options.js';
import logger from '../common/helper/logger.js';

import {Execution} from "../common/models/environments.js";
import {Project} from "../common/models/internal.js";

import readline from 'readline';
import chalk from 'chalk';

"use strict";
export default new class {
    /**
     * Handler for dependencies
     * @param config {Project}
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
                await this.#run(config, runtime);
                break;
            default:
                this.#showHelp(yargs);
        }
    }

    /**
     * Generate default or component options
     * @param yargs {object}
     * @param config {Project}
     * @returns {*|Object}
     */
    getOptions(yargs, config) {
        const options = yargs
            .positional('keyword', {
                describe: 'Keyword for component',
                type: 'string'
            })
            .option('start', {
                describe: 'Start project dependencies',
            })
            .option('stop', {
                describe: 'Stop project dependencies'
            })
            .option('start-group', {
                describe: 'Start group of project dependencies'
            })
            .option('stop-group', {
                describe: 'Stop group of project dependencies'
            })
            .option('not', {
                alias: 'n',
                describe: 'Include name of executions to avoid starting or stopping it'
            })
            .option('not-group', {
                alias: 'ng',
                describe: 'Include group name of executions to avoid starting or stopping them'
            })
            .option('clean', {
                describe: `Usage '--start --clean' which will do a clean startup`
            })
            .option('s', {
                alias: 'skip',
                describe: 'Skip confirmation messages'
            })
            .option('shc', {
                alias: 'skip-hash-check',
                describe: 'Skip hash check when running command'
            });

        const customOptions = this.#getCustomOptions(config.environment);
        return customOption.addOptionsToYargs(options, customOptions);
    }

    /**
     * Handles handlers for each environment dependency
     * @param config {Project}
     * @param runtime {Runtime}
     * @returns {Promise<void>}
     */
    async #run(config, runtime) {
        const executions = this.#getExecutions(config, runtime);

        logger.create();

        const options = this.#getCustomOptions(executions);
        const result = customOption.validateOptions(runtime.args, options);
        if (!result.status) {
            console.error(result.message);
            return;
        }

        if (!this.#validate(executions)) {
            console.error(chalk.redBright(`One or more of the executions are either missing type or name!`));
            return;
        }

        if (!this.#checkAvailabilityOfDependencies(executions)) {
            return;
        }

        if (!await this.#confirmRunningWithoutElevated(runtime.args.skip, executions)) {
            return;
        }

        for (const execution of executions) {
            const lowerCaseName = execution?.name?.toLowerCase();
            const lowerCaseGroup = execution?.group?.toLowerCase();

            if (runtime.include.executions.length > 0 && !runtime.include.executions.some(x => x.toLowerCase() === lowerCaseName) ||
                runtime.include.groups.length > 0 && !runtime.include.groups.some(x => x.toLowerCase() === lowerCaseGroup)) {
                continue;
            }

            if (runtime.exclude.executions.length > 0 && runtime.exclude.executions.some(x => x.toLowerCase() === lowerCaseName) ||
                runtime.exclude.groups.length > 0 && runtime.exclude.groups.some(x => x.toLowerCase() === lowerCaseGroup)) {
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

        logger.destroy();

        if (logger.hasLogs()) {
            console.log(chalk.yellow(`One or more executions ended with errors. Please check the log for more detail. ${logger.getLogFile()}`));
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
     * Validate executions
     * @param executions {Execution[]}
     */
    #validate(executions) {
        return !executions.some(x => x.name == null || x.type == null);
    }

    /**
     *
     * @param args {EnvArgs}
     * @returns {Runtime}
     */
    #getRuntime(args) {
        const stop = args.hasOwnProperty('stop');
        const start = args.hasOwnProperty('start');
        const stopGroup = args.hasOwnProperty('stop-group');
        const startGroup = args.hasOwnProperty('start-group');

        if (stop === start && stopGroup === startGroup) {
            return {
                start: start || startGroup,
                stop: stop || stopGroup
            };
        }

        const choice = start || startGroup ? 'start' : 'stop';

        return {
            start: start || startGroup,
            stop: stop || stopGroup,
            include: {
                executions: this.#getVariables(args[choice]),
                groups: this.#getVariables(args[`${choice}-group`])
            },
            exclude: {
                executions: this.#getVariables(args.not),
                groups: this.#getVariables(args.notGroup)
            },
            clean: args.hasOwnProperty('clean'),
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

    /**
     * Maps environment to ensure usage of proper start or stop values
     * @param config {Project}
     * @param runtime {Runtime}
     * @returns {Execution[]}
     */
    #getExecutions(config, runtime) {
        const executions = config.environment.map(x => {
            return new Execution(x, runtime);
        });

        if (runtime.stop) {
            return executions.reverse();
        }

        return executions;
    }
};

class EnvArgs {
    /**
     * Option for starting environment
     * @type {boolean|string|string[]}
     */
    start;

    /**
     * Option for stopping environment
     * @type {boolean|string|string[]}
     */
    stop;

    /**
     * Starts one or more groups of executions
     * @type {boolean|string|string[]}
     */
    startGroup;

    /**
     * Stops one or more groups of executions
     * @type {boolean|string|string[]}
     */
    stopGroup;

    /**
     * Option (optional) included with start for starting environment cleanly
     * @type {boolean}
     */
    clean;

    /**
     * List of execution names which should not be included in starting or stopping
     * @type {boolean|string|string[]}
     */
    not;

    /**
     * List of group names which should not be included in starting or stopping
     * @type {boolean|string|string[]}
     */
    notGroup;

    /**
     * Component
     * @type {string}
     */
    keyword;

    /**
     * Skip warnings (typically used together with --start, if e.g. something needs to be elevated but you actually don't need it)
     * @type {boolean}
     */
    skip;
}
