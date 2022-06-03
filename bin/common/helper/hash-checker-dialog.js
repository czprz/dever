import hashChecker from './hash-checker.js';

import chalk from "chalk";
import readline from "readline";

export default new class {
    /**
     * Verify user wants to continue
     * @param project {Project}
     * @param keyword {string}
     * @param callback {Function}
     */
    confirm(project, keyword, callback) {
        if (hashChecker.check(project)) {
            callback();
            return;
        }

        console.warn(chalk.yellow(`dever.json has been modified since last run.`));
        console.warn(chalk.yellow(`check content of dever.json using 'dever ${keyword} config'`));
        const rl = readline.createInterface(process.stdin, process.stdout);
        rl.question('Have you verified dever.json does not contain anything unwanted? [yes]/no:', async (answer) => {
            if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
                hashChecker.update(project);
                callback();
            }

            rl.close();
        });
    }
}