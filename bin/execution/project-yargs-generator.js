import projectConfigHandler from "../configuration/handlers/project-config-handler.js";
import executorYargsGenerator from "./executor/executor-yargs-generator.js";

import chalk from "chalk";

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
        for (const segment of project.segments) {
            yargs
                .command('$0', 'Show help', () => {}, () => {
                    if (yargs.argv._.length > 0) {
                        console.log(chalk.redBright('Invalid command or option'));
                        yargs.showHelp();
                    }
                })
                .command({
                    command: segment.key,
                    desc: segment.description,
                    builder: (yargs) => executorYargsGenerator.options(yargs, project, segment),
                    handler: (argv) => {
                        if (argv._.length < 2) {
                            yargs.showHelp();
                        }
                    }
                });
        }

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