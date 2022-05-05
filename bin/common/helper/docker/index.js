const docker_states = Object.freeze({"NotFound":0, "Running":1, "NotRunning":2});

"use strict";
module.exports = new class {
    states = docker_states;
    container = require('./container');

    /**
     * Checks whether docker engine is running or not
     * @returns {boolean}
     */
    is_docker_running() {
        const { execSync } = require("child_process");
        try {
            execSync('docker container ls', { windowsHide: true, encoding: 'UTF-8', stdio: "ignore" });
            return true;
        } catch {
            return false;
        }
    }
}

