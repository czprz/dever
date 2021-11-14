const {execSync} = require("child_process");
const docker_states = Object.freeze({"NotFound":0, "Running":1, "NotRunning":2});

module.exports = new class {
    states = docker_states;
    container = require('./container');

    /**
     * @deprecated since 0.6
     * @param container_name {string}
     * @returns {number}
     */
    is_container_running(container_name) {
        try {
            const result = execSync(`docker container inspect -f '{{.State.Running}}' ${container_name}`, {
                windowsHide: true,
                encoding: 'UTF-8'
            });
            if (result.includes('true')) {
                return docker_states.Running;
            }
        } catch {
            return docker_states.NotFound;
        }

        return docker_states.NotRunning;
    }

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

    /**
     * Attempts to start docker engine
     * @returns {boolean}
     */
    start_docker() {
        const { execSync } = require("child_process");
        try {
            execSync('start "C:\Program Files\Docker\Docker\Docker Desktop.exe"', { windowsHide: true, encoding: 'utf8'});
            return true;
        } catch {
            return false;
        }
    }
}

