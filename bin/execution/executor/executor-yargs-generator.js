import executor from "./index.js";
import runtimeMapper from "./runtime-mapper.js";

export default new class {
    /**
     * Generate default or component options
     * @param yargs {object}
     * @param actions {Action[]}
     * @returns {*|Object}
     */
    options(yargs, actions) {
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
                    this.#execute(actions, argv).catch(console.error);
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
                    this.#execute(actions, argv).catch(console.error);
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
                    this.#execute(actions, argv).catch(console.error);
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
                    this.#execute(actions, argv).catch(console.error);
                }
            });

        // Todo: Add support for listing executions in groups
        // Todo: Add support for custom options
        // Todo: Do not show up/down group options if no group is defined
    }

    async #execute(actions, argv) {
        const runtime = runtimeMapper.getRuntime(argv);
        await executor.run(actions, runtime);
    }
}