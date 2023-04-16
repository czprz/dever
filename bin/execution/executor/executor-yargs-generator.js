import executor from "./index.js";
import runtimeMapper from "./runtime-mapper.js";
import hashCheckerDialog from "../../common/helper/hash-checker-dialog.js";
import {Action} from "../../common/models/dever-json/internal.js";

import chalk from "chalk";
import customOptionsYargsCreator from "../../common/helper/options/custom-options-yargs-creator.js";

export default new class {
    /**
     * Generate default or component options
     * @param yargs {object}
     * @param project {Project}
     * @param segment {Segment}
     * @returns {*|Object}
     */
    options(yargs, project, segment) {
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

                    customOptionsYargsCreator.addToYargs(yargs, segment.actions)
                },
                handler: (argv) => {
                    this.#execute(segment, project, argv).catch(console.error);
                }
            })
            .command({
                command: 'up-group <name>',
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

                    customOptionsYargsCreator.addToYargs(yargs, segment.actions)
                },
                handler: (argv) => {
                    this.#execute(segment, project, argv).catch(console.error);
                }
            })
            .command({
                command: 'run <name>',
                desc: 'Run action continuously',
                builder: (yargs) => {
                    yargs
                        .positional('name', {
                            describe: 'Name of the action',
                            type: 'string'
                        })
                        .option('times', {
                            alias: 't',
                            describe: 'Number of times to run action (0 - infinite)',
                            type: 'number',
                            default: 0,
                            coerce: (value) => {
                                if (value < 0) {
                                    throw new Error('Option --times, -t must be positive value');
                                }
                                return value;
                            }
                        })
                        .option('interval', {
                            alias: 'i',
                            describe: 'Interval between runs (seconds)',
                            type: 'number',
                            demandOption: true,
                            coerce: (value) => {
                                if (value < 0) {
                                    throw new Error('Option --interval, -i must be positive value');
                                }
                                return value;
                            }
                        });

                    customOptionsYargsCreator.addToYargs(yargs, segment.actions)
                },
                handler: (argv) => {
                    this.#execute(segment, project, argv).catch(console.error);
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

                    customOptionsYargsCreator.addToYargs(yargs, segment.actions)
                },
                handler: (argv) => {
                    this.#execute(segment, project, argv).catch(console.error);
                }
            })
            .command({
                command: 'down-group <name>',
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

                    customOptionsYargsCreator.addToYargs(yargs, segment.actions)
                },
                handler: (argv) => {
                    this.#execute(segment, project, argv).catch(console.error);
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
                    this.#list(segment.actions, argv);
                }
            });
    }

    /**
     * Execute actions
     * @param segment {Segment}
     * @param project {Project}
     * @param argv {Args}
     * @return {Promise<void>}
     */
    async #execute(segment, project, argv) {
        hashCheckerDialog.confirm(argv.skipHashCheck ?? false, project, argv.keyword, async () => {
            const runtime = runtimeMapper.getRuntime(argv);
            await executor.run(segment, project, runtime);
        });
    }

    /**
     * List all actions
     * @param actions {Action[]}
     * @param argv {object}
     */
    #list(actions, argv) {
        if (argv.group == null) {
            console.log('Listing all actions:');
        } else {
            console.log('Listing all actions in group:');
        }

        if (actions == null || actions.length === 0) {
            console.log(chalk.yellow('No actions found'));
            return;
        }

        if (argv.group && !actions.some(action => action.group.some(a => a.toLowerCase() === argv.group.toLowerCase()))) {
            console.error(chalk.yellow(`No actions with group '${argv.group}' found`));
            return;
        }

        for (const action of actions) {
            if (argv.group && !action.group.some(x => x.toLowerCase() === argv.group.toLowerCase())) {
                continue;
            }

            console.log(chalk.green(action.name));
        }
    }
}