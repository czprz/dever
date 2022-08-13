import projectConfigHandler from "../configuration/handlers/project-config-handler.js";
import hashCheckerDialog from "./helper/hash-checker-dialog.js";
import executor from "./config-executor.js";
import fix from '../fix/index.js';

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
        this.#setupOfInstallHandler(keyword, project, yargs);
        this.#setupOfEnvHandler(keyword, project, yargs);
        this.#setupOfFixHandler(keyword, project, yargs);
        this.#setupOfConfigHandler(project, yargs);
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
    #setupOfInstallHandler(keyword, project, yargs) {
        if (project.install == null) {
            return;
        }

        yargs
            .command({
                command: `install`,
                desc: 'Install project depended packages and functionality',
                builder: (yargs) => executor.getOptions(yargs, project),
                handler: (argv) => {
                    hashCheckerDialog.confirm(argv.skipHashCheck ?? false, project, keyword, () => executor.handler(project, yargs, argv).catch(console.error));
                }
            });
    }

    /**
     * Create commands for environment section
     * @param keyword {string}
     * @param project {Project}
     * @param yargs
     */
    #setupOfEnvHandler(keyword, project, yargs) {
        if (project.environment == null) {
            return;
        }

        yargs
            .command({
                command: 'env',
                desc: 'Development environment organizer',
                builder: (yargs) => executor.getOptions(yargs, project),
                handler: (argv) => {
                    hashCheckerDialog.confirm(argv.skipHashCheck ?? false, project, keyword, () => executor.handler(project, yargs, argv).catch(console.error));
                }
            });
    }

    /**
     * Create commands for fix section
     * @param keyword {string}
     * @param project {Project}
     * @param yargs
     */
    #setupOfFixHandler(keyword, project, yargs) {
        if (project.fix == null) {
            return;
        }

        yargs
            .command({
                command: 'fix [key]',
                desc: 'Fix common possibly repeatable issues',
                builder: (yargs) => fix.getOptions(yargs),
                handler: (argv) => {
                    hashCheckerDialog.confirm(argv.skipHashCheck ?? false, project, keyword, () => fix.handler(project, yargs, argv).catch(console.error));
                }
            })
    }

    /**
     * Setup for configuration handler
     * @param project {Project}
     * @param yargs {object}
     */
    #setupOfConfigHandler(project, yargs) {
        yargs
            .command({
                command: 'config',
                desc: 'Manage project configuration',
                builder: (yargs) => projectConfigHandler.options(yargs, project),
                handler: () => {
                    yargs.showHelp();
                }
            });
    }
}