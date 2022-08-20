import logger from "../common/helper/logger.js";
import executor from "../common/executor/index.js";
import responder from "../common/executor/responder/index.js";
import {Status} from "../common/executor/models.js";

import runtimeHelper from "./runtime-mapper.js";
import actionMapper from "./action-mapper.js";
import validator from "./validator.js";
import elevatedConfirmer from "./elevated-confirmer.js";

import chalk from "chalk";

export default new class {
    /**
     * Executes actions
     * @param actions {Action[]}
     * @param yargs {object}
     * @param args {Args}
     * @returns {Promise<void>}
     */
    async run(actions, yargs, args) {
        const runtime = runtimeHelper.getRuntime(args);
        if (runtime.up && runtime.down) {
            console.error(chalk.redBright('You cannot defined both --up and --down in the same command'));
            return;
        }

        switch (true) {
            case runtime.up:
            case runtime.down: {
                const executables = actionMapper.map(actions, runtime);

                logger.create();

                const result = validator.validate(executables, runtime);
                if (!result.status) {
                    console.error(result.message);
                    return;
                }

                const checkResult = await executor.dependencyCheck(executables);
                if (checkResult.status === Status.Error) {
                    responder.respond(checkResult, null);
                    return;
                }

                if (!await elevatedConfirmer.confirm(runtime.args.skip, executables)) {
                    return;
                }

                for (const executable of executables) {
                    await this.#hasWait(executable, 'before');
                    await this.#executeStep(executable.before, runtime);

                    const result = await executor.execute(executable, runtime);
                    responder.respond(result, executable);

                    await this.#executeStep(executable.after, runtime);
                    await this.#hasWait(executable, 'after');
                }

                logger.destroy();

                if (logger.hasLogs()) {
                    console.log(chalk.yellow(`One or more actions ended with errors. Please check the log for more detail. ${logger.getLogFile()}`));
                }

                break;
            }
            default:
                yargs.showHelp();
        }
    }

    /**
     * Generate default or component options
     * @param yargs {object}
     * @param actions {Action[]}
     * @returns {*|Object}
     */
    options(yargs, actions) {
        return yargs
            .positional('keyword', {
                describe: 'Keyword for project',
                type: 'string'
            })
            .option('up', {
                describe: 'Setup project environment',
            })
            .option('down', {
                describe: 'Take down project environment',
            })
            .option('up-group', {
                describe: 'Setup project environment using only items from group',
            })
            .option('down-group', {
                describe: 'Take down project environment using only items from group',
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

        // Todo: Improve description for options
        // Todo: Add support for listing executions in groups
        // Todo: Add support for custom options
    }

    /**
     * Creates promise which delays an await for defined period of time
     * @param executable {Executable}
     * @param timing {'after'|'before'}
     * @returns {Promise<unknown>}
     */
    #hasWait(executable, timing) {
        if (executable.wait == null) {
            return null;
        }

        if (executable.wait.when === timing) {
            return new Promise(resolve => setTimeout(resolve, executable.wait.time));
        }
    }

    /**
     * Executes before or after steps
     * @param executable {Executable}
     * @param runtime {Runtime}
     * @return {Promise<void>}
     */
    async #executeStep(executable, runtime) {
        if (executable == null) {
            return;
        }

        await executor.execute(executable, runtime);
    }
}