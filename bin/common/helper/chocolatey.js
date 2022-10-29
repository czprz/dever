import powershell from "./powershell.js";
import sudo from "./elevated.js";
import readline from "readline";
import {Subject} from "rxjs";

export default new class {
    logger = new Subject();

    /**
     *
     * @return {Promise<void>}
     */
    async install() {
        if (!await sudo.isElevated()) {
            this.logger.next(new State('NotElevated'));
            this.logger.complete();

            return;
        }

        const rl = readline.createInterface(process.stdin, process.stdout);
        rl.question('Are you sure you want to install Chocolatey? [yes]/no:', (answer) => {
            if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
                try {
                    this.logger.next(new State('Started'));
                    powershell.executeSync('Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString(\'https://community.chocolatey.org/install.ps1\'))')
                    this.logger.next(new State('Success'));
                } catch (e) {
                    this.logger.next(new State('Error', e));
                }
            } else {
                this.logger.next(new State('Skipped'));
            }

            this.logger.complete();

            rl.close();
        });
    }
}

export class State {
    /**
     * @type {'Started'|'Skipped'|'NotElevated'|'Success'|'Error'}
     */
    state;

    /**
     * @type {Error|null}
     */
    error;

    /**
     *
     * @param state {'Started'|'Skipped'|'NotElevated'|'Success'|'Error'}
     * @param error {Error|null}
     */
    constructor(state, error = null) {
        this.state = state;
        this.error = error;
    }
}