module.exports = {
    execute: execute,
    executeSync: executeSync,
    executeFileSync: executeFileSync,
    command: command
};

function execute(file) {
    const spawn = require("child_process").spawn;
    const child = spawn("powershell.exe", [file]);

    child.stdout.on("data", function (data) {
        console.log(`${data}`);
    });

    child.stderr.on("data", function (data) {
        console.error(`${data}`);
    });

    child.on("exit", function () {
        console.log("Powershell Script finished");
    });

    child.stdin.end();
}

/**
 * Runs powershell command asynchronous
 * @param command {string}
 * @param callback {function(error: ExecException | null, stdout: string, stderr: string)}
 */
function command(command, callback) {
    const {exec} = require('child_process');
    exec(command, {'shell': 'powershell.exe'}, callback);
}

/**
 * Runs powershell command synchronously
 * @param command {string}
 * @returns {string}
 */
function executeSync(command) {
    const {execSync} = require('child_process');
    return execSync(command, {'shell': 'powershell.exe', encoding: 'utf8'});
}

/**
 * Runs powershell file synchronously
 * @param file {string}
 * @return {string}
 */
function executeFileSync(file) {
    const {execSync} = require('child_process');
    return execSync(`powershell.exe -ExecutionPolicy Bypass -File ${file}`, {
        'shell': 'powershell.exe',
        encoding: 'utf8'
    });
}
