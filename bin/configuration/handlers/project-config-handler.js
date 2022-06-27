import projectConfigFacade from "../facades/project-config-facade.js";
import configUpdater from "../config-updater.js";
import configGetter from "../config-getter.js";

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
                describe: 'Show project configuration',
                handler: () => {
                    this.#showConfig(project);
                }
            })
            .command({
                command: 'location',
                describe: 'Show location of project configuration file',
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

        console.log(project.location.full);
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
     * @param argv {object}
     * @param project {Project}
     */
    #setConfig(argv, project) {
        const key = argv._[2];
        const value = argv._[3];

        if (key == null || key.length === 0 || value == null) {
            console.warn(`Missing key or value. Please try again with 'dever [keyword] config get [key] [value]'`);
            return;
        }

        configUpdater.update(`projects.${project.id}.${key}`, value);
    }

    /**
     * Gets project configuration
     * @param argv {object}
     * @param project {Project}
     */
    #getConfig(argv, project) {
        const key = argv._[2];

        if (key == null) {
            console.warn(`Missing key. Please try again with 'dever [keyword] config get [key]'`);
            return;
        }

        configGetter.get(`projects.${project.id}.${key}`);
    }

    /**
     * Lists available project configuration and it's current value
     * @param argv {object}
     * @param project {Project}
     */
    #listConfig(argv, project) {
        const local = projectConfigFacade.getLocalValues(project.id);
        console.log(chalk.yellow(`skipHashCheck: `) + local.skipHashCheck);
    }
}