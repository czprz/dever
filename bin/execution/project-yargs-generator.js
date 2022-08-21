import projectConfigHandler from "../configuration/handlers/project-config-handler.js";
import hashCheckerDialog from "../common/helper/hash-checker-dialog.js";
import installExecutor from './install/index.js';
import fixExecutor from './fix/index.js';

import executorYargsGenerator from "../new_executor/executor-yargs-generator.js";

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
                desc: 'Install project dependencies',
                builder: (yargs) => installExecutor.getOptions(yargs, project.install),
                handler: (argv) => {
                    hashCheckerDialog.confirm(argv.skipHashCheck ?? false, project, keyword, () => installExecutor.handler(project.install, yargs, argv).catch(console.error));
                }
                // Todo: Create commands for up and down instead of having them as options // Create task for this
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
                builder: (yargs) => executorYargsGenerator.options(yargs, project.environment),
                handler: (argv) => {
                    if (argv._.length < 2) {
                        yargs.showHelp();
                    }
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
                builder: (yargs) => fixExecutor.getOptions(yargs),
                handler: (argv) => {
                    hashCheckerDialog.confirm(argv.skipHashCheck ?? false, project, keyword, () => fixExecutor.handler(project, yargs, argv).catch(console.error));
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