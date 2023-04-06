import projectConfigFacade from "../configuration/facades/project-config-facade.js";
import configValidator from '../common/helper/config-validator.js';
import localConfigHandler from "../configuration/handlers/local-config-handler.js";
import init from "../init.js";

import path from 'path';
import chalk from 'chalk';
import scanner from "../scanner/index.js";

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
                desc: 'Add dever support to your project',
                builder: (yargs) => {
                    yargs
                        .option('p', {
                            alias: 'path',
                            describe: 'Path to project that you want to add dever support'
                        });
                },
                handler: (argv) => {
                    init.init(argv.path).catch(console.error);
                }
            })
            .command({
                command: 'scan',
                desc: 'Scans for dever supported projects',
                handler: () => {
                    scanner.scan().catch(console.error);
                }
            })
            .command({
                command: 'list',
                desc: `List all dever supported projects`,
                builder: (yargs) => {
                    yargs
                        .option('not-supported', {
                            describe: 'List all unsupported dever projects'
                        });
                },
                handler: (argv) => {
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
            desc: 'Project segment handling'
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
        const projects = projectConfigFacade.getAll()?.filter(x => x.supported && x.validSchema && x.validKeywords);
        if (projects == null || projects.length === 0) {
            console.error(`Could not find any projects. Please try running ${chalk.green('dever scan')}`);
            return;
        }

        console.log('List of all projects found after last ' + chalk.green('dever scan'));

        for (const project of projects) {
            console.log(`${chalk.blue(project.name)} - ${chalk.green(project.internal.keywords)}`);
        }
    }

    #listAllUnsupportedProjects() {
        const projects = projectConfigFacade.getAll()?.filter(x => !x.supported || !x.validSchema || !x.validKeywords);
        if (projects == null || projects.length === 0) {
            console.error('Could not find any unsupported projects. Please try running ' + chalk.green('dever scan'));
            return;
        }

        console.log('List of all unsupported found after last ' + chalk.green('dever scan'));
        console.log(`Use 'dever validate -f [filePath]' to find out why they're unsupported`);

        for (const project of projects) {
            console.log(`${chalk.green(project.location.full)}`);
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
            desc: `Validate dever.json config file`,
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
                    const instancePath = !error.instancePath ? '' :  error.instancePath + ': ';
                    console.log(chalk.red(instancePath + error.message));
                }
            } else if (result.message != null) {
                console.error(chalk.redBright(result.message));
            }

            return;
        }

        console.log('No problems with dever.json');
    }
}