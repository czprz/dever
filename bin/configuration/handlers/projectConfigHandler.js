import localConfig from "../local-config.js";

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

    }

    /**
     * Gets project configuration
     * @param argv
     * @param project
     */
    #getConfig(argv, project) {

    }

    /**
     * Lists available project configuration and it's current value
     * @param argv
     * @param project
     */
    #listConfig(argv, project) {
        const config = localConfig.get().projects.find(x => x.path === project.location);
        console.log(chalk.yellow(`skipHashCheck:`) + project.skipHashCheck)
    }
}