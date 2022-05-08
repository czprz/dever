import {execSync} from 'child_process';

"use strict";
export default new class {
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