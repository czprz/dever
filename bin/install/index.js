import shell from '../common/helper/shell.js';
import sudo from '../common/helper/elevated.js';

import readline from 'readline';
import chalk from 'chalk';
import logger from "../common/helper/logger.js";

"use strict";
export default new class {
    /**
     * Handler for fixes
     * @param project {Project}
     * @param yargs {object}
     * @param args {InstallArgs}
     * @returns {Promise<void>}
     */
    async handler(project, yargs, args) {
        switch (true) {
            case args.listGroups:
                this.#listGroups(project);
                break;
            case args.list:
                this.#showListOfPackages(project);
                break;
            case args.listGroup != null:
                this.#showAllInstallsForSpecificGroup(project, args);
                break;
            case args.group != null:
                await this.#installAllWithSameGroup(project, args);
                break;
            case args.only != null:
                await this.#installOnlyPackage(project, args);
                break;
            default:
                await this.#installAllPackages(project, args);
        }
    }

    /**
     * Generate default or project options
     * @param yargs {object}
     * @returns {*|Object}
     */
    getOptions(yargs) {
        return yargs
            .option('list', {
                alias: 'l',
                describe: `List all options under install section in the projects dever.json`,
            })
            .option('list-groups', {
                alias: 'lgs',
                describe: 'List of all installation groups under install section in the projects dever.json'
            })
            .option('list-group', {
                alias: 'lg',
                describe: 'List of all installs underneath a specific group in the projects dever.json'
            })
            .option('group', {
                alias: 'g',
                describe: 'Install all items underneath a specific group in the projects dever.json'
            })
            .option('only', {
                alias: 'o',
                describe: 'Install only specific package'
            })
            .option('ignore', {
                alias: 'i',
                describe: 'Ignore confirmations'
            })
            .option('no-before-after', {
                alias: 'nba',
                describe: 'Disables running of before and after functionality if defined in project dever.json'
            })
            .option('shc', {
                alias: 'skip-hash-check',
                describe: 'Skip hash check when running command'
            });
    }

    /**
     * Show all groups and what they will install
     * @param project {Project}
     */
    #listGroups(project) {
        console.log('Lists all available installs for the project by group.')

        const sorted = project.install.sort(x => x.group);
        let prevGroup = null;

        for (const install of sorted) {
            if (prevGroup !== install.group) {
                console.log();
                console.log(`--- ${install.group} ---`);
                prevGroup = install.group;
            }

            this.#showPackage(install);
        }
    }

    /**
     * List all packages for project
     * @param project {Project}
     */
    #showListOfPackages(project) {
        console.log('Lists all available installs for the project.');

        for (const install of project.install) {
            this.#showPackage(install);
        }
    }

    /**
     * List all installs for a specific install group
     * @param project {Project}
     * @param args {InstallArgs}
     */
    #showAllInstallsForSpecificGroup(project, args) {
        if (project.install.length === 0) {
            console.log('Project does not have an install section');
            return;
        }

        if (typeof args.listGroup !== 'string') {
            console.log('Missing input. Please include group name');
            return;
        }

        const installs = project.install.filter(x => x.group.toLowerCase() === args.listGroup.toLowerCase());
        if (installs.length === 0) {
            console.log('Could not find any installs for this project with that specific group');
            return;
        }

        console.log('List of installs found:');

        for (const install of installs) {
            this.#showPackage(install);
        }
    }

    /**
     * Installs all items defined under a project install group
     * @param project {Project}
     * @param args {InstallArgs}
     */
    async #installAllWithSameGroup(project, args) {
        if (!await sudo.isElevated()) {
            console.log(chalk.red('Install of packages requires elevated permissions'));
            return;
        }

        if (project.install.length === 0) {
            console.log('Project does not have an install section');
            return;
        }

        const groupInstalls = project.install.filter(x => x.group.toLowerCase() === args.group.toLowerCase());
        if (groupInstalls.length === 0) {
            console.log('Could not find any installs for this project with that specific group');
            return;
        }

        this.#install(groupInstalls, args);
    }

    /**
     * Install only specific project install package
     * @param project {Project}
     * @param args {InstallArgs}
     */
    async #installOnlyPackage(project, args) {
        if (!await sudo.isElevated()) {
            console.log(chalk.red('Install of packages requires elevated permissions'));
            return;
        }

        if (project.install.length === 0) {
            console.log('Project does not have an install section');
            return;
        }

        const install = project.install.find(x => x.package.toLowerCase() === args.only.toLowerCase());
        if (install == null) {
            console.log('Could not find any install package');
            return;
        }

        this.#install([install], args);
    }

    /**
     * Install all items for specific project or show help
     * @param project {Project}
     * @param args {InstallArgs}
     */
    async #installAllPackages(project, args) {
        if (!await sudo.isElevated()) {
            console.log(chalk.red('Install of packages requires elevated permissions'));
            return;
        }

        this.#install(project.install, args);
    }

    /**
     * Confirm before callback is executed
     * @param args {InstallArgs}
     * @param callback {function}
     */
    #confirmInstall(args, callback) {
        if (args.ignore) {
            callback();
            return;
        }

        const rl = readline.createInterface(process.stdin, process.stdout);
        rl.question('Are you sure you want to install all packages? [yes]/no:', (answer) => {
            if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
                rl.close();

                return;
            }

            callback();

            rl.close();
        });
    }

    #showPackage(install) {
        console.log();

        switch (install.type) {
            case 'chocolatey': {
                console.log(`Type: ` + chalk.blue('Chocolatey'));
                console.log('Package: ' + chalk.green(install.package));
                break;
            }
            default:
                throw new Error('Install type not supported');
        }

        if (install.after || install.before) {
            console.log((install.after ? 'After' : 'Before') + `: powershell-command "${install.after ? install.after.command : install.before.command}"`);
        }
    }

    /**
     * Start installation of all packages
     * @param installs {Install[]}
     * @param args {InstallArgs}
     */
    #install(installs, args) {
        if (installs.length > 1) {
            console.log('Packages about to be installed:');

            for (const install of installs) {
                this.#showPackage(install);
            }

            console.log();
        }

        logger.create();

        this.#confirmInstall(args, () => {
            for (const install of installs) {
                console.log(`Installing ${install.type}: ${install.package}..`);

                try {
                    this.#executeStep(args, install.before);

                    shell.executeSync(`choco install ${install.package} -y`);

                    this.#executeStep(args, install.after);

                    console.log(`${install.type}: '${install.package}' completed successfully`);
                } catch (e) {
                    logger.error(`${install.type}: '${install.package}' completed with errors`, e);
                }
            }
        });

        logger.destroy();

        if (logger.hasLogs()) {
            console.log(chalk.yellow(`Install command ended with errors. Please check the log for more detail. ${logger.getLogFile()}`));
        }
    }

    /**
     * Execute either before or after
     * @param args {InstallArgs}
     * @param step {Step}
     */
    #executeStep(args, step) {
        if (args.noBeforeAfter || step == null) {
            return;
        }

        switch (step.type) {
            case 'powershell-command':
                // Todo: Add support for using any functionality available
                shell.executeSync(step.command);
                break;
            default:
                throw new Error('Install before or after command type not supported');
        }
    }
}

class InstallArgs {
    /**
     * Unique project keyword
     * @return {string}
     */
    keyword;

    /**
     * Show list of possible fixes
     * @return {boolean}
     */
    list;

    /**
     * List all groups and which items are underneath each group
     * @return {boolean}
     */
    listGroups;

    /**
     * List all install items underneath specific group name
     * @return {string}
     */
    listGroup;

    /**
     * Install all items with specific group name
     * @return {string}
     */
    group;

    /**
     * Only install specifically defined package/item
     * @return {string}
     */
    only;

    /**
     * Do not run before or after if defined in dever.json install section
     * @return {boolean}
     */
    noBeforeAfter;

    /**
     * Ignore confirmations
     * @return {boolean}
     */
    ignore;
}
