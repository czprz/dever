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

        console.log();

        console.warn(chalk.yellow(`dever.json has been modified since last run.`));

        const rl = readline.createInterface(process.stdin, process.stdout);
        this.#options();
        this.#choose(project, callback, rl);
    }

    #choose(project, callback, rl, answer = null) {
        if (answer != null) {
            console.log();
            console.warn(chalk.yellow('Wrong input. Please choose one of the options below.'));
            this.#options();
        }

        rl.question('Which option do you choose?:', async (answer) => {
            if (answer === '1') {
                console.log(project);
                rl.close();
            } else if (answer === '2') {
                hashChecker.update(project);
                callback();
                rl.close();
            } else {
                this.#choose(project, callback, rl, answer);
            }
        });
    }

    #options() {
        console.log(`1. Check content of dever.json`);
        console.log(`2. Ignore modification and execute command`);
        console.log();
    }
}