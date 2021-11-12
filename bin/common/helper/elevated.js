const sudo = require('sudo-prompt');

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
     * Check if process is already running with elevated privileges
     * @return {Promise<boolean>}
     */
    isElevated() {
        return new Promise(() => true);
    }
}