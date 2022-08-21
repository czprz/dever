import sudo from "../common/helper/elevated.js";
import delayer from "../common/helper/delayer.js";

import {Executable} from "./action-mapper.js";

import chalk from "chalk";
import readline from "readline";

export default new class {
    /**
     * User confirmation for running without elevated permissions
     * @param skip {boolean}
     * @param executables {Executable[]}
     * @returns {Promise<boolean>}
     */
    async confirm(skip, executables) {
        if (skip) {
            return true;
        }

        if (await sudo.isElevated()) {
            return true;
        }

        if (!this.#anyElevatedPermissionsRequired(executables)) {
            return true;
        }

        console.log(chalk.redBright('There is one or more executions which needs elevated permissions.'));
        console.log(chalk.redBright(`It's recommended to run this command again with a terminal started with elevated permissions.`));
        console.log();

        const timer = delayer.create();

        const rl = readline.createInterface(process.stdin, process.stdout);
        await rl.question('Are you sure you want to continue? [yes]/no:', async (answer) => {
            if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
                timer.done(true);
            } else {
                timer.done(false);
            }

            rl.close();
        });

        return timer.delay(36000000, false);
    }

    /**
     * Check if any executables needs to run with elevated permissions
     * @param executables {Executable[]}
     * @return {boolean}
     */
    #anyElevatedPermissionsRequired(executables) {
        for (const executable of executables) {
            if (executable.elevated) {
                return true;
            }
        }

        return false;
    }
}