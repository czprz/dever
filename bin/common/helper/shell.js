module.exports = {
    execute: execute,
    executeSync: executeSync
}

function execute(command, withoutLog = true) {
    const { exec } = require("child_process");
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
function executeSync(command) {
    const { execSync } = require("child_process");
    return execSync(command, { windowsHide: true, encoding: 'utf-8' });
}