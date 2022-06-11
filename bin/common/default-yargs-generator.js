import projectConfigFacade from "../configuration/facades/projectConfigFacade.js";
import versionChecker from '../common/helper/version-checker.js';
import configValidator from '../common/helper/config-validator.js';
import localConfigHandler from "../configuration/handlers/localConfigHandler.js";
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
                        });
                },
                handler: (argv) => {
                    console.log(argv);
                    switch (true) {
                        case argv.notSupported:
                            this.#listAllUnsupportedProjects();
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
        const projects = projectConfigFacade.getAll();
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
        const projects = projectConfigFacade.getAll();
        if (projects == null || projects.length === 0) {
            console.error(`Could not find any projects. Please try running ${chalk.green('dever init')}`);
            return;
        }

        const unsupported = versionChecker.getOnlyUnsupported(projects);

        console.log(`List of all unsupported projects found after last ${chalk.green('dever init')} scan`);

        for (const project of unsupported) {
            console.log(`${chalk.blue(project.name)} - ${chalk.green(project.keywords)}`);
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
            console.error(chalk.redBright(result.message));
            return;
        }

        console.log('No problems with dever.json');
    }
}