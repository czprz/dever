const config_handler = require("../configuration/handleConfigFile");
const components_handler = require("../configuration/handleComponents");

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
                handler: () => {
                    this.#listAllComponents();
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
        const projects = components_handler.getAllComponents();
        if (projects == null || projects.length === 0) {
            console.error(`Could not find any components. Please try running ${chalk.green('dever init')}`);
            return;
        }

        console.log(`List of all components found after last ${chalk.green('dever init')} scan`);

        for (const component of projects) {
            console.log(`${chalk.blue(component.name)} - ${chalk.green(component.keywords)}`);
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
}