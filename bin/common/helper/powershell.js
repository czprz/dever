const {exec, execSync} = require('child_process');

module.exports = new class {
    /**
     * Executes powershell command asynchronous
     * @param command {string}
     * @param callback {function(error: ExecException | null, stdout: string, stderr: string)}
     * @return {void}
     */
    execute(command, callback) {
        exec(command, {'shell': 'powershell.exe'}, callback);
    }

    /**
     * Executes powershell command synchronously
     * @param command {string}
     * @returns {string}
     */
    executeSync(command) {
        return execSync(command, {'shell': 'powershell.exe', encoding: 'utf8'});
    }

    /**
     * Executes powershell file synchronously
     * @param file {string}
     * @return {string}
     */
    executeFileSync(file) {
        return execSync(`powershell.exe -ExecutionPolicy Bypass -File ${file}`, {
            'shell': 'powershell.exe',
            encoding: 'utf8'
        });
    }
}