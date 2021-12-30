const readline = require("readline");
const chalk = require("chalk");

const config = require('../configuration/handleInstallConfig');
const shell = require("../common/helper/shell");
const sudo = require('../common/helper/elevated');

module.exports = new class {
    /**
     * Handler for fixes
     * @param yargs {object}
     * @param args {InstallArgs}
     * @returns {Promise<void>}
     */
    async handler(yargs, args) {
        switch (true) {
            case args.listGroups:
                this.#listGroups(args);
                break;
            case args.list:
                args.keyword ?
                    this.#showListOfPackages(args) :
                    this.#showListOfProjects();
                break;
            case args.listGroup != null:
                this.#showAllInstallsForSpecificGroup(args);
                break;
            case args.group != null:
                this.#installAllGroupInstalls(args);
                break;
            case args.only != null:
                this.#installOnlyPackage(args);
                break;
            default:
                this.#installAllOrShowHelp(yargs, args);
        }
    }

    /**
     * Generate default or project options
     * @param yargs {object}
     * @returns {*|Object}
     */
    getOptions(yargs) {
        const keyword = this.#getKeywordFromArgv(yargs.argv);
        return keyword == null ?
            this.#getOptionsWithoutKeyword(yargs) :
            this.#getOptionsWithKeyword(yargs, keyword);
    }

    /**
     * Show all groups and what they will install
     * @param args {InstallArgs}
     */
    #listGroups(args) {
        const installs = config.get(args.keyword);
        if (installs == null) {
            console.log('Could not find any projects with [keyword]');
            return;
        }

        console.log('Lists all available installs for the project by group.')

        const sorted = installs.sort(x => x.group);
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
     * List all projects
     */
    #showListOfProjects() {
        const projects = config.getProjectsWithInstalls();

        if (projects == null || projects.length === 0) {
            console.error(`Could not find any projects which has an install section. Please try running ${chalk.green('dever init')}`);
            return;
        }

        console.log(`List of all projects with an install section found after last ${chalk.green('dever init')} scan`);

        for (const project of projects) {
            console.log(`${chalk.blue(project.component)} - ${chalk.green(project.keywords)}`);
        }
    }

    /**
     * List all packages for project
     * @param args {InstallArgs}
     */
    #showListOfPackages(args) {
        const installs = config.get(args.keyword);
        if (installs == null) {
            console.log('Could not find any projects with [keyword]');
            return;
        }

        console.log('Lists all available installs for the project.');

        for (const install of installs) {
            this.#showPackage(install);
        }
    }

    /**
     * List all installs for a specific install group
     * @param args {InstallArgs}
     */
    #showAllInstallsForSpecificGroup(args) {
        const installs = config.get(args.keyword);
        if (installs == null) {
            console.log('Could not find any projects with [keyword]');
            return;
        }

        if (installs.length === 0) {
            console.log('Project does not have an install section');
            return;
        }

        if (typeof args.listGroup !== 'string') {
            console.log('Missing input. Please include group name');
            return;
        }

        const groupInstalls = installs.filter(x => x.group.toLowerCase() === args.listGroup.toLowerCase());
        if (groupInstalls.length === 0) {
            console.log('Could not find any installs for this project with that specific group');
            return;
        }

        console.log('List of installs found:');

        for (const install of groupInstalls) {
            this.#showPackage(install);
        }
    }

    /**
     * Installs all items defined under a project install group
     * @param args {InstallArgs}
     */
    async #installAllGroupInstalls(args) {
        if (!await sudo.isElevated()) {
            console.log('Install of packages requires elevated permissions');
            return;
        }

        const installs = config.get(args.keyword);
        if (installs == null) {
            console.log('Could not find any projects with [keyword]');
            return;
        }

        if (installs.length === 0) {
            console.log('Project does not have an install section');
            return;
        }

        const groupInstalls = installs.filter(x => x.group.toLowerCase() === args.group.toLowerCase());
        if (groupInstalls.length === 0) {
            console.log('Could not find any installs for this project with that specific group');
            return;
        }

        console.log('Packages about to be installed:');

        for (const install of installs) {
            this.#showPackage(install);
        }

        console.log();

        this.#confirmInstall(args, () => {
            for (const install of groupInstalls) {
                this.#installPackage(args, install);
            }
        });
    }

    /**
     * Install only specific project install package
     * @param args {InstallArgs}
     */
    async #installOnlyPackage(args) {
        if (!await sudo.isElevated()) {
            console.log('Install of packages requires elevated permissions');
            return;
        }

        const installs = config.get(args.keyword);
        if (installs == null) {
            console.log('Could not find any projects with [keyword]');
            return;
        }

        if (installs.length === 0) {
            console.log('Project does not have an install section');
            return;
        }

        const install = installs.find(x => x.package.toLowerCase() === args.only.toLowerCase());
        if (install == null) {
            console.log('Could not find any install package');
            return;
        }

        this.#confirmInstall(args, () => {
            this.#installPackage(args, install);
        });
    }

    /**
     * Install all items for specific project or show help
     * @param yargs {object}
     * @param args {InstallArgs}
     */
    async #installAllOrShowHelp(yargs, args) {
        if (args.keyword) {
            if (!await sudo.isElevated()) {
                console.log('Install of packages requires elevated permissions');
                return;
            }

            console.log('Packages about to be installed:');

            const installs = config.get(args.keyword);
            if (installs == null || installs.length === 0) {
                console.log('No or empty install section found for project');
                return;
            }

            for (const install of installs) {
                this.#showPackage(install);
            }

            console.log();

            this.#confirmInstall(args, () => {
                for (const install of installs) {
                    // Todo: Better handling of error/progress messages
                    this.#installPackage(args, install);
                }
            })

            return;
        }

        yargs.showHelp();
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
     * Install chocolatey package
     * @param args {InstallArgs}
     * @param install {Install}
     */
    #installPackage(args, install) {
        this.executeStep(args, install.before);

        shell.executeSync(`choco install ${install.package} -y`);

        this.executeStep(args, install.after);
    }

    /**
     * Execute either before or after
     * @param args {InstallArgs}
     * @param step {Step}
     */
    executeStep(args, step) {
        if (args.noBeforeAfter || step == null) {
            return;
        }

        switch(step.type) {
            case 'powershell-command':
                shell.executeSync(step.command);
                break;
            default:
                throw new Error('Install before or after command type not supported');
        }
    }

    /**
     * Get all options without project
     * @param yargs {object}
     * @returns {object}
     */
    #getOptionsWithoutKeyword(yargs) {
        return yargs
            .positional('keyword', {
                describe: 'One of the defined project keywords',
                type: 'string'
            })
            .option('list', {
                alias: 'l',
                describe: 'List all currently known projects which has install section defined in dever.json',
            });
    }

    /**
     * Get all project install options
     * @param yargs {object}
     * @param keyword {string}
     * @returns {object}
     */
    #getOptionsWithKeyword(yargs, keyword) {
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
            });
    }

    /**
     * Get keyword from yargs
     * @param argv {object}
     * @returns {null|*}
     */
    #getKeywordFromArgv(argv) {
        if (argv.length < 2) {
            return null;
        }

        return argv._[1];
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
