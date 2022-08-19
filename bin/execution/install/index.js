import sudo from '../../common/helper/elevated.js';
import delayer from '../../common/helper/delayer.js';
import customOptions from '../../common/helper/options/custom-options-creator.js';
import logger from '../../common/helper/logger.js';

import Executor from "../../common/executor/index.js";
import Responder from "../../common/executor/responder/index.js";

import {Args} from "../../common/models/common.js";
import {Executable, Runtime} from "../../common/models/dever-json/internal.js";
import {Status} from "../../common/executor/models.js";

import readline from 'readline';
import chalk from 'chalk';

"use strict";
export default new class {
    /**
     * Handler for executions
     * @param executables {Executable[]}
     * @param yargs {object}
     * @param args {Args}
     * @returns {Promise<void>}
     */
    async handler(executables, yargs, args) {
        const runtime = this.#getRuntime(args);
        if (runtime.up && runtime.down) {
            console.error(chalk.redBright('You cannot defined both --up and --down in the same command'));
            return;
        }

        switch (true) {
            case runtime.up:
            case runtime.down:
                await this.#run(executables, runtime);
                break;
            default:
                this.#showHelp(yargs);
        }
    }

    /**
     * Generate default or component options
     * @param yargs {object}
     * @param executions {Executable[]}
     * @returns {*|Object}
     */
    getOptions(yargs, executions) {
        const options = yargs
            .positional('keyword', {
                describe: 'Project keyword',
                type: 'string'
            })
            .option('up', {
                describe: 'Install dependencies',
            })
            .option('down', {
                describe: 'Uninstall dependencies',
            })
            .option('up-group', {
                describe: 'Install only specified group dependencies',
            })
            .option('down-group', {
                describe: 'Uninstall only specified group dependencies',
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
                describe: `Usage '--up --clean' which will do a clean startup`
            })
            .option('s', {
                alias: 'skip',
                describe: 'Skip confirmation messages'
            })
            .option('shc', {
                alias: 'skip-hash-check',
                describe: 'Skip hash check when running command'
            });

        // Todo: Add support for listing executions in groups

        return customOptions.addToYargs(options, executions);
    }

    /**
     * Handles execution of up or down
     * @param executables {Executable[]}
     * @param runtime {Runtime}
     * @returns {Promise<void>}
     */
    async #run(executables, runtime) {
        const executions = this.#getExecutions(executables, runtime);

        logger.create();

        if (!this.#validate(executions, runtime)) {
            return;
        }

        const result = customOptions.validate(runtime.args, executions);
        if (!result.status) {
            console.error(result.message);
            return;
        }

        const checkResult = await Executor.dependencyCheck(executions);
        if (checkResult.status === Status.Error) {
            Responder.respond(checkResult, null);
            return;
        }

        if (!await this.#confirmRunningWithoutElevated(runtime.args.skip, executions)) {
            return;
        }

        for (const execution of executions) {
            await this.#hasWait(execution, 'before');
            await this.executeStep(execution.before, runtime);

            const result = await Executor.execute(execution, runtime);
            Responder.respond(result, execution);

            await this.executeStep(execution.after, runtime);
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
     * Executes before or after steps
     * @param execute {Execute}
     * @param runtime {Runtime}
     * @return {Promise<void>}
     */
    async executeStep(execute, runtime) {
        if (execute == null) {
            return;
        }

        await Executor.execute(execute, runtime);
    }

    /**
     * Check if confirmation message should be shown if some steps in dever.json needs to be elevated and shell is not run with elevated permissions
     * @param skip {boolean}
     * @param executables {Executable[]}
     * @returns {Promise<boolean>}
     */
    async #confirmRunningWithoutElevated(skip, executables) {
        if (skip) {
            return true;
        }

        if (await sudo.isElevated()) {
            return true;
        }

        if (executables.some(executable => executable.runAsElevated != null && executable.runAsElevated)) {
            return true;
        }

        console.log(chalk.redBright('There is one or more executions which needs elevated permissions.'));
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
     * @param args {Args}
     * @returns {Runtime}
     */
    #getRuntime(args) {
        const up = args.hasOwnProperty('up');
        const down = args.hasOwnProperty('down');
        const upGroup = args.hasOwnProperty('up-group');
        const downGroup = args.hasOwnProperty('down-group');

        if (up === down && downGroup === upGroup) {
            return {
                up: up || upGroup,
                down: down || downGroup
            };
        }

        const choice = down || upGroup ? 'up' : 'down';

        return {
            up: up || upGroup,
            down: down || downGroup,
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
     * @param executables {Executable[]}
     * @param runtime {Runtime}
     * @returns {Executable[]}
     */
    #getExecutions(executables, runtime) {
        let executions = executables.map(executable => {
            const lowerCaseName = executable?.name?.toLowerCase();
            const lowerCaseGroup = executable?.group?.toLowerCase();

            const notIncluded = runtime.include.executions.length > 0 && !runtime.include.executions.some(x => x.toLowerCase() === lowerCaseName);
            const notIncludedGroup = runtime.include.groups.length > 0 && !runtime.include.groups.some(x => x.toLowerCase() === lowerCaseGroup);

            if (notIncluded || notIncludedGroup) {
                return null;
            }

            if (!notIncluded && !notIncludedGroup && executable.optional) {
                return null;
            }

            if (runtime.exclude.executions.length > 0 && runtime.exclude.executions.some(x => x.toLowerCase() === lowerCaseName) ||
                runtime.exclude.groups.length > 0 && runtime.exclude.groups.some(x => x.toLowerCase() === lowerCaseGroup)) {
                return null;
            }

            return new Executable(executable, runtime);
        });

        if (runtime.down) {
            executions = executions.reverse();
        }

        return executions.filter(x => x != null);
    }
};