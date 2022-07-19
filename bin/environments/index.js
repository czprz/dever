import sudo from '../common/helper/elevated.js';
import delayer from '../common/helper/delayer.js';
import customOption from '../common/helper/custom_options.js';
import logger from '../common/helper/logger.js';

import Executor from "../common/executor/index.js";
import Responder from "../common/executor/responder/index.js";

import {Project, Executable, Runtime} from "../common/models/dever-json/internal.js";
import {Status} from "../common/executor/models.js";

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
        if (runtime.up && runtime.down) {
            console.error(chalk.redBright('You cannot defined both --start and --stop in the same command'));
            return;
        }

        switch (true) {
            case runtime.up:
            case runtime.down:
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
        const executables = this.#getExecutions(config, runtime);

        logger.create();

        if (!this.#validate(executables, runtime)) {
            return;
        }

        const options = this.#getCustomOptions(executables);
        const result = customOption.validateOptions(runtime.args, options);
        if (!result.status) {
            console.error(result.message);
            return;
        }

        const checkResult = await Executor.dependencyCheck(executables);
        if (checkResult.status === Status.Error) {
            // Todo: Add response handler
            return;
        }

        if (!await this.#confirmRunningWithoutElevated(runtime.args.skip, executables)) {
            return;
        }

        for (const executable of executables) {
            await this.#hasWait(executable, 'before');
            await Executor.execute(executable.before, runtime);

            const result = await Executor.execute(executable, runtime);
            Responder.respond(result, executable);

            await Executor.execute(executable.after, runtime);
            await this.#hasWait(executable, 'after');
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
     * @param executions {Action[]}
     * @return {Option[]}
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
     * @param execution {Action}
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
     * @param executables {Executable[]}
     * @returns {Promise<boolean>}
     */
    async #confirmRunningWithoutElevated(ignore, executables) {
        if (ignore) {
            return true;
        }

        if (await sudo.isElevated()) {
            return true;
        }

        if (!this.#anyDependencyWhichNeedsElevatedPermissions(executables)) {
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
     * @param executables {Executable[]}
     * @return {boolean}
     */
    #anyDependencyWhichNeedsElevatedPermissions(executables) {
        for (const executable of executables) {
            if (executable.runAsElevated != null && executable.runAsElevated) {
                return true;
            }
        }

        return false;
    }

    /**
     * Validate executions
     * @param executions {Executable[]}
     * @param runtime {Runtime}
     */
    #validate(executions, runtime) {
        if (executions.length === 0) {
            console.error(chalk.redBright('No executions found matching your criteria.'));
            return false;
        }

        if (executions.some(x => x.name == null || x.type == null)) {
            console.error(chalk.redBright(`One or more of the executions are either missing type or name!`));
            return false;
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
        const stopGroup = args.hasOwnProperty('stop-group');
        const startGroup = args.hasOwnProperty('start-group');

        if (stop === start && stopGroup === startGroup) {
            return {
                up: start || startGroup,
                down: stop || stopGroup
            };
        }

        const choice = start || startGroup ? 'start' : 'stop';

        return {
            up: start || startGroup,
            down: stop || stopGroup,
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
     * @returns {Executable[]}
     */
    #getExecutions(config, runtime) {
        let executions = config.environment.map(executable => {
            const lowerCaseName = executable?.name?.toLowerCase();
            const lowerCaseGroup = executable?.group?.toLowerCase();

            if (runtime.include.executions.length > 0 && !runtime.include.executions.some(x => x.toLowerCase() === lowerCaseName) ||
                runtime.include.groups.length > 0 && !runtime.include.groups.some(x => x.toLowerCase() === lowerCaseGroup)) {
                return null;
            }

            if (runtime.exclude.executions.length > 0 && runtime.exclude.executions.some(x => x.toLowerCase() === lowerCaseName) ||
                runtime.exclude.groups.length > 0 && runtime.exclude.groups.some(x => x.toLowerCase() === lowerCaseGroup)) {
                return null;
            }

            return executable;
        });

        if (runtime.down) {
            executions = executions.reverse();
        }

        return executions.filter(x => x != null);
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
