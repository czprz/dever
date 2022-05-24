import container from './container.js';

import {execSync} from "child_process";

const docker_states = Object.freeze({"NotFound":0, "Running":1, "NotRunning":2});

"use strict";
export default new class {
    states = docker_states;
    container = container;

    /**
     * Checks whether docker engine is running or not
     * @returns {boolean}
     */
    is_docker_running() {
        try {
            execSync('docker container ls', { windowsHide: true, encoding: 'UTF-8', stdio: "ignore" });
            return true;
        } catch {
            return false;
        }
    }
}

