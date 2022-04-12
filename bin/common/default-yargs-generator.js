const config_handler = require("../configuration/handleConfigFile");
const projectsConfig = require("../configuration/projects-config");
const versionChecker = require('../common/helper/version-checker');
const configValidator = require('../common/helper/config-validator');

const path = require("path");
const init = require("../init");
const chalk = require("chalk");

module.exports = new class {
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
                handler: (argv) => {
                    init.init(argv).catch(console.error);
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
                    switch (true) {
                        case argv.notSupported:
                            this.#listAllUnsupportedProjects();
                            break;
                        default:
                            this.#listAllComponents();
                    }
                }
            })
            .command({
                command: 'config',
                desc: 'Show content of dever configuration file',
                builder: (yargs) => {
                    yargs
                        .option('l', {
                            alias: 'location',
                            describe: 'Show location of dever configuration file'
                        });
                },
                handler: (argv) => {
                    switch (true) {
                        case argv.location:
                            this.#showLocation();
                            break;
                        default:
                            this.#showConfig();
                    }
                }
            })
            .command({
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
                        case argv.file != null:
                        {
                            this.#validate(argv.file);
                            break;
                        }
                        default:
                        {
                            const file = path.join(process.cwd(), 'dever.json');
                            this.#validate(file);
                        }
                    }
                }
            })
            .command({
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
    #listAllComponents() {
        const projects = projectsConfig.getAll();
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
        const projects = projectsConfig.getAll();
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

    /**
     * Show location of dever configuration file
     */
    #showLocation() {
        const filePath = config_handler.getFilePath();
        if (filePath == null) {
            console.error('Could not find dever.json');
            return;
        }

        console.log(filePath);
    }

    /**
     * Show content of dever configuration
     */
    #showConfig() {
        const config = config_handler.get();
        if (config == null) {
            console.error(chalk.redBright('Could not find dever configuration'));
            return;
        }

        console.log(config);
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