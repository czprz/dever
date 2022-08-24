import executor from "./index.js";
import runtimeMapper from "./runtime-mapper.js";

import chalk from "chalk";

export default new class {
    /**
     * Generate default or component options
     * @param yargs {object}
     * @param location {Location}
     * @param actions {Action[]}
     * @returns {*|Object}
     */
    options(yargs, location, actions) {
        return yargs
            .command({
                command: 'up [name]',
                desc: 'Run actions',
                builder: (yargs) => {
                    yargs
                        .positional('name', {
                            describe: 'Name of the action',
                            type: 'string'
                        })
                        .option('clean', {
                            alias: 'c',
                            describe: 'Clean run of actions',
                            type: 'boolean'
                        })
                        .option('not', {
                            alias: 'n',
                            describe: 'Exclude actions',
                        })
                        .option('not-group', {
                            alias: 'ng',
                            describe: 'Exclude group of actions',
                        })
                        .option('skip', {
                            alias: 's',
                            describe: 'Skip confirmation',
                        })
                        .option('skip-hash-check', {
                            alias: 'shc',
                            describe: 'Skip hash check',
                        });
                },
                handler: (argv) => {
                    this.#execute(actions, location, argv).catch(console.error);
                }
            })
            .command({
                command: 'up-group [name]',
                desc: 'Run group of actions',
                builder: (yargs) => {
                    yargs
                        .positional('name', {
                            describe: 'Name of the actions group',
                            type: 'string'
                        })
                        .option('clean', {
                            alias: 'c',
                            describe: 'Clean run of actions',
                            type: 'boolean'
                        })
                        .option('not', {
                            alias: 'n',
                            describe: 'Exclude actions',
                        })
                        .option('skip', {
                            alias: 's',
                            describe: 'Skip confirmation',
                        })
                        .option('skip-hash-check', {
                            alias: 'shc',
                            describe: 'Skip hash check',
                        });
                },
                handler: (argv) => {
                    this.#execute(actions, location, argv).catch(console.error);
                }
            })
            .command({
                command: 'down [name]',
                desc: 'Take down actions',
                builder: (yargs) => {
                    yargs
                        .positional('name', {
                            describe: 'Name of the action',
                            type: 'string'
                        })
                        .option('not', {
                            alias: 'n',
                            describe: 'Exclude actions',
                        })
                        .option('not-group', {
                            alias: 'ng',
                            describe: 'Exclude group of actions',
                        })
                        .option('skip', {
                            alias: 's',
                            describe: 'Skip confirmation',
                        })
                        .option('skip-hash-check', {
                            alias: 'shc',
                            describe: 'Skip hash check',
                        });
                },
                handler: (argv) => {
                    this.#execute(actions, location, argv).catch(console.error);
                }
            })
            .command({
                command: 'down-group [name]',
                desc: 'Take down one or more group of actions',
                builder: (yargs) => {
                    yargs
                        .positional('name', {
                            describe: 'Name of actions group',
                            type: 'string'
                        })
                        .option('not', {
                            alias: 'n',
                            describe: 'Exclude actions',
                        })
                        .option('skip', {
                            alias: 's',
                            describe: 'Skip confirmation',
                        })
                        .option('skip-hash-check', {
                            alias: 'shc',
                            describe: 'Skip hash check',
                        });
                },
                handler: (argv) => {
                    this.#execute(actions, location, argv).catch(console.error);
                }
            })
            .command({
                command: 'list [group]',
                desc: 'List all actions',
                builder: (yargs) => {
                    yargs
                        .positional('group', {
                            describe: 'Name of actions group',
                            type: 'string',
                            default: null
                        });
                },
                handler: (argv) => {
                    this.#list(actions, argv);
                }
            });

        // Todo: Add support for listing executions in groups
        // Todo: Add support for custom options
    }

    /**
     * Execute actions
     * @param actions {Action[]}
     * @param location {Location}
     * @param argv {Args}
     * @return {Promise<void>}
     */
    async #execute(actions, location , argv) {
        const runtime = runtimeMapper.getRuntime(argv);
        await executor.run(actions, location, runtime);
    }

    /**
     * List all actions
     * @param actions {Action[]}
     * @param argv {object}
     */
    #list(actions, argv) {
        console.log('Listing all actions found:');

        if (actions == null || actions.length === 0) {
            console.log(chalk.yellow('No actions found'));
            return;
        }

        if (argv.group && !actions.some(action => action.group === argv.group)) {
            console.error(chalk.yellow(`No actions with group '${argv.group}' found`));
            return;
        }

        for (const action of actions) {
            if (argv.group && action.group !== argv.group) {
                continue;
            }

            console.log(chalk.green(action.name));
        }
    }
}