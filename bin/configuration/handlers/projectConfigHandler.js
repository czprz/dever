import projectConfigFacade from "../facades/projectConfigFacade.js";

import chalk from "chalk";

export default new class {
    /**
     * Generate project config options
     * @param yargs {object}
     * @param project {Project}
     * @returns {*|Object}
     */
    options(yargs, project) {
        return yargs
            .command({
                command: 'set',
                describe: 'Sets config key to value provided',
                handler: (argv) => {
                    this.#setConfig(argv, project);
                }
            })
            .command({
                command: 'get',
                describe: 'Show value of config key',
                handler: (argv) => {
                    this.#getConfig(argv, project);
                }
            })
            .command({
                command: 'list',
                describe: 'Lists available configuration options and their current value',
                handler: (argv) => {
                    this.#listConfig(argv, project);
                }
            })
            .command({
                command: 'show',
                describe: 'Show content of project dever.json',
                handler: () => {
                    this.#showConfig(project);
                }
            })
            .command({
                command: 'location',
                describe: 'Show location of dever configuration file',
                handler: () => {
                    this.showLocation(project);
                }
            });
    }

    /**
     * Show location of project configuration file
     * @param project {Project}
     */
    showLocation(project) {
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

    /**
     * Sets project configuration
     * @param argv
     * @param project {Project}
     */
    #setConfig(argv, project) {
        const key = this.#getKeys(argv._[2]);
        const value = argv._[3];

        if (key == null || key.length === 0 || value == null) {
            console.warn(`Missing key or value. Please try again with 'dever [keyword] config get [key] [value]'`);
            return;
        }

        switch (key[0]) {
            case 'skiphashcheck':
                projectConfigFacade.update(project.id, (project) => {
                    project.skipHashCheck = value === 'true' || value === '1';
                });
                break;
            default:
                console.warn('Key is not supported');
        }
    }

    /**
     * Gets project configuration
     * @param argv
     * @param project
     */
    #getConfig(argv, project) {
        const key = this.#getKeys(argv._[2]);
        if (key == null) {
            console.warn(`Missing key. Please try again with 'dever [keyword] config get [key]'`);
            return;
        }

        switch (key[0]) {
            case 'skiphashcheck':
                const local = projectConfigFacade.getLocalValues(project.id);
                console.log(chalk.yellow(`skipHashCheck: `) + local.skipHashCheck)
                break;
            default:
                console.warn('Key is not supported');
        }
    }

    /**
     * Lists available project configuration and it's current value
     * @param argv
     * @param project
     */
    #listConfig(argv, project) {
        const local = projectConfigFacade.getLocalValues(project.id);
        console.log(chalk.yellow(`skipHashCheck: `) + local.skipHashCheck);
    }

    /**
     * Transforms string into a number of a keys
     * @param arg {string}
     * @returns string[]
     */
    #getKeys(arg) {
        if (arg == null) {
            return null;
        }

        const keys = arg.split('.').map(x => x.toLowerCase());
        if (keys.length === 0) {
            return null;
        }

        return keys;
    }
}