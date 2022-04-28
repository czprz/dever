const {exec, execSync} = require('child_process');

const sudo = require('./elevated');
const delayer = require('./delayer');

module.exports = new class {
    /**
     * Executes powershell command asynchronous
     * @param command {string}
     * @param callback {function(error: ExecException | null, stdout: string, stderr: string)}
     * @param elevated {boolean} @Optional @Default=false
     * @return {void}
     */
    async execute(command, callback, elevated = false) {
        if (await this.#shouldRunElevated(elevated)) {
            sudo.command(`powershell.exe -command "${command}"`, 'powershell', callback);
        }

        exec(command, {'shell': 'powershell.exe'}, callback);
    }

    /**
     * Executes powershell command synchronously
     * @param command {string}
     * @param elevated {boolean} @Optional @Default=false
     * @returns {Promise<string> | string}
     */
    async executeSync(command, elevated = false) {
        if (await this.#shouldRunElevated(elevated)) {
            const timer = delayer.create();

            sudo.command(`powershell.exe -command "${command}"`, 'powershell', error => {
                timer.done(error == null);
            });

            return await timer.delay(36000000, 'Powershell could not execute as during waiting for elevated permission prompt expired');
        }

        return execSync(command, {
            shell: 'powershell.exe',
            encoding: 'utf8',
            stdio: ['ignore']
        });
    }

    /**
     * Executes powershell file synchronously
     * @param file {string}
     * @param elevated {boolean} @Optional @Default=false
     * @return {Promise<void> | string}
     */
    async executeFileSync(file, elevated = false) {
        if (await this.#shouldRunElevated(elevated)) {
            const timer = delayer.create();

            sudo.command(`powershell.exe -ExecutionPolicy Bypass -File ${file}`, 'Powershell', (error) => {
                timer.done(error == null);
            });

            return timer.delay(36000000, 'Powershell could not execute as during waiting for elevated permission prompt expired');
        }

        return execSync(`powershell.exe -ExecutionPolicy Bypass -File "${file}"`, {
            shell: 'powershell.exe',
            encoding: 'utf8',
            stdio: ['ignore']
        });
    }

    /**
     * Check if execution should be run as elevated
     * @param runAsElevated {boolean}
     * @return {Promise<boolean>}
     */
    async #shouldRunElevated(runAsElevated) {
        return runAsElevated && !await sudo.isElevated();
    }
}