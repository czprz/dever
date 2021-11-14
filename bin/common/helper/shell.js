const { exec, execSync} = require("child_process");

module.exports = new class {
    /**
     * Execute command asynchronous
     * @param command {string}
     * @param withoutLog {boolean}
     * @return {void}
     */
    execute(command, withoutLog = true) {
        exec(command, (error, stdout, stderr) => {
            if (withoutLog) {
                return;
            }

            if (error) {
                console.log(`${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`${stderr}`);
                return;
            }
            console.log(`${stdout}`);
        });
    }

    /**
     * Execute command synchronously
     * @param command
     * @returns {string|*}
     */
    executeSync(command) {
        return execSync(command, { windowsHide: true, encoding: 'utf-8' });
    }
}