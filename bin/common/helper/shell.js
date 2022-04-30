const {execSync} = require("child_process");

"use strict";
module.exports = new class {
    /**
     * Execute command synchronously
     * @param command
     * @returns {string|*}
     */
    executeSync(command) {
        return execSync(command, {
            windowsHide: true,
            encoding: 'utf-8',
            stdio: ['ignore']
        });
    }
}