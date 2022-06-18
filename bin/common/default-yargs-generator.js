import projectConfigFacade from "../configuration/facades/project-config-facade.js";
import configValidator from '../common/helper/config-validator.js';
import localConfigHandler from "../configuration/handlers/local-config-handler.js";
import init from "../init.js";

import path from 'path';
import chalk from 'chalk';

"use strict";
export default new class {
    /**
     * Get yargs structure for default
     * @param yargs {object}
     * @return void
     */
    create(yargs) {
        yargs
            .command({
                command: 'init',
                desc: 'Initializes dever and searches for dever.json files',
                handler: () => {
                    init.init().catch(console.error);
                }
            })
            .command({
                command: 'list',
                desc: `List all projects found by running 'dever init'`,
                builder: (yargs) => {
                    yargs
                        .option('not-supported', {
                            describe: 'List all projects with a dever.json which version is not supported'
                        })
                        .option('invalid', {
                            describe: 'List all projects with a dever.json which has an invalid json structure'
                        });
                },
                handler: (argv) => {
                    switch (true) {
                        case argv.notSupported:
                            this.#listAllUnsupportedProjects();
                            break;
                        case argv.invalid:
                            this.#listAllInvalidSchemaProjects();
                            break;
                        default:
                            this.#listAllProjects();
                    }
                }
            });

        this.#setupForConfig(yargs);
        this.#setupForValidation(yargs);

        yargs.command({
            command: '[keyword]',
            desc: 'Functionality for helping project development'
        });
    }

    /**
     * Run show help for default
     * @param yargs {object}
     */
    defaultAction(yargs) {
        if (yargs.argv._.length === 0) {
            yargs.showHelp();
        }
    }

    /**
     * Shows a list of found components in the console
     */
    #listAllProjects() {
        const projects = projectConfigFacade.getAll()?.filter(x => x.supported && x.validSchema);
        if (projects == null || projects.length === 0) {
            console.error(`Could not find any projects. Please try running ${chalk.green('dever init')}`);
            return;
        }

        console.log(`List of all projects found after last ${chalk.green('dever init')} scan`);

        for (const project of projects) {
            console.log(`${chalk.blue(project.name)} - ${chalk.green(project.keywords)}`);
        }
    }

    #listAllUnsupportedProjects() {
        const projects = projectConfigFacade.getAll().filter(x => !x.supported);
        if (projects == null || projects.length === 0) {
            console.error(`Could not find any unsupported projects. Please try running ${chalk.green('dever init')}`);
            return;
        }

        console.log(`List of all unsupported projects found after last ${chalk.green('dever init')} scan`);

        for (const project of projects) {
            console.log(`${chalk.blue(project.name)} - ${chalk.green(project.keywords)}`);
        }
    }

    #listAllInvalidSchemaProjects() {
        const projects = projectConfigFacade.getAll().filter(x => !x.validSchema);
        if (projects == null || projects.length === 0) {
            console.error(`Could not find any projects with invalid json structure. Please try running ${chalk.green('dever init')}`);
            return;
        }

        console.log(`List of all projects with invalid json structure found after last ${chalk.green('dever init')} scan`);

        for (const project of projects) {
            console.log(`${chalk.green(project.location)}`);
        }
    }

    #setupForConfig(yargs) {
        yargs
            .command({
                command: `config`,
                desc: 'Manage dever configuration',
                builder: (yargs) => localConfigHandler.options(yargs),
                handler: () => {
                    yargs.showHelp();
                }
            });
    }

    #setupForValidation(yargs) {
        yargs.command({
            command: 'validate',
            desc: `Validate dever.json config file before running 'dever init'`,
            builder: (yargs) => {
                yargs
                    .option('f', {
                        alias: 'file',
                        describe: 'Filepath for dever.json that needs to be validated'
                    });
            },
            handler: (argv) => {
                switch (true) {
                    case argv.file != null: {
                        this.#validate(argv.file);
                        break;
                    }
                    default: {
                        const file = path.join(process.cwd(), 'dever.json');
                        this.#validate(file);
                    }
                }
            }
        })
    }

    #validate(file) {
        const result = configValidator.validateFile(file);
        if (!result.status) {
            if (result.schemaErrors != null) {
                for (const error of result.schemaErrors) {
                    console.log(chalk.red(error.instancePath + ': ' + error.message));
                }
            } else if (result.message != null) {
                console.error(chalk.redBright(result.message));
            }

            return;
        }

        console.log('No problems with dever.json');
    }
}