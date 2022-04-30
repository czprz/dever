const sudo = require('sudo-prompt');
const execa = require("execa");

"use strict";
module.exports = new class {
    /**
     * Run shell command as elevated
     * @param command {string}
     * @param name {string}
     * @param callback {(error?: Error, stdout?: string | Buffer, stderr?: string | Buffer) => void}
     * @return {void}
     */
    command(command, name, callback) {
        sudo.exec(command, {name: name}, callback);
    }

    /**
     * Check if process is already running with elevated privileges<br>
     * @deprecated Deprecated since 0.6 - Will be removed when dever supports importing and replaced with usage of 'is-elevated' npmjs package
     * @return {Promise<boolean>}
     */
    async isElevated() {
        if (process.platform !== 'win32') {
            return false;
        }

        try {
            await execa('fsutil', ['dirty', 'query', process.env.systemdrive]);
            return true;
        } catch (error) {
            if (error.code === 'ENOENT') {
                return this.#testFltmc();
            }

            return false;
        }
    }

    /**
     * @returns {Promise<boolean>}
     */
    async #testFltmc() {
        try {
            await execa('fltmc');
            return true;
        } catch {
            return false;
        }
    }
}