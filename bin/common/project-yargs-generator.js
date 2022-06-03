import hashCheckerDialog from "./helper/hash-checker-dialog.js";
import install from '../install/index.js';
import env from '../environments/index.js';
import fix from '../fix/index.js';

import chalk from 'chalk';

"use strict";
export default new class {
    /**
     * Get yargs structure for project
     * @param keyword {string}
     * @param project {Project}
     * @param yargs {object}
     * @return void
     */
    create(keyword, project, yargs) {
        this.#createInstall(keyword, project, yargs);
        this.#createEnvironment(keyword, project, yargs);
        this.#createFix(keyword, project, yargs);

        yargs
            .command({
                command: 'config',
                desc: 'Show content of project configuration file',
                builder: (yargs) => {
                    yargs
                        .option('l', {
                            alias: 'location',
                            describe: 'Show location of project configuration file'
                        });
                },
                handler: (argv) => {
                    switch (true) {
                        case argv.location:
                            this.#showConfigLocation(project);
                            break;
                        default:
                            this.#showConfig(project);
                    }
                }
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
     * Create commands for install section
     * @param keyword {string}
     * @param project {Project}
     * @param yargs
     */
    #createInstall(keyword, project, yargs) {
        if (project.install == null) {
            return;
        }

        yargs
            .command({
                command: `install`,
                desc: 'Install project depended packages and functionality',
                builder: (yargs) => install.getOptions(yargs),
                handler: (argv) => {
                    hashCheckerDialog.confirm(project, keyword, () => install.handler(project, yargs, argv).catch(console.error));
                }
            });
    }

    /**
     * Create commands for environment section
     * @param keyword {string}
     * @param project {Project}
     * @param yargs
     */
    #createEnvironment(keyword, project, yargs) {
        if (project.environment == null) {
            return;
        }

        yargs
            .command({
                command: 'env',
                desc: 'Development environment organizer',
                builder: (yargs) => env.getOptions(yargs, project),
                handler: (argv) => {
                    hashCheckerDialog.confirm(project, keyword, () => env.handler(project, yargs, argv).catch(console.error));
                }
            });
    }

    /**
     * Create commands for fix section
     * @param keyword {string}
     * @param project {Project}
     * @param yargs
     */
    #createFix(keyword, project, yargs) {
        if (project.fix == null) {
            return;
        }

        yargs
            .command({
                command: 'fix [key]',
                desc: 'Fix common possibly repeatable issues',
                builder: (yargs) => fix.getOptions(yargs),
                handler: (argv) => {
                    hashCheckerDialog.confirm(project, keyword, () => fix.handler(project, yargs, argv).catch(console.error));
                }
            })
    }

    /**
     * Show location of project configuration file
     * @param project {Project}
     */
    #showConfigLocation(project) {
        if (project == null) {
            console.error(chalk.redBright('Could not find project'));
            return;
        }

        console.log(project.location);
    }

    /**
     * Show content of project configuration file
     * @param project {Project}
     */
    #showConfig(project) {
        if (project == null) {
            console.error(chalk.redBright('Could not find project'));
            return;
        }

        console.log(project);
    }
}