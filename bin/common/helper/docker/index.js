const docker_states = Object.freeze({"NotFound":0, "Running":1, "NotRunning":2});

module.exports = {
    /**
     * @deprecated since 1.4
     */
    is_container_running: is_container_running,
    is_docker_running: is_docker_running,
    start_docker: start_docker,
    states: docker_states,
    container: require('./container')
}

/**
 * @deprecated since 1.4
 * @param container_name {string}
 * @returns {number}
 */
function is_container_running(container_name) {
    const { execSync } = require("child_process");
    try {
        var result = execSync(`docker container inspect -f '{{.State.Running}}' ${container_name}`, { windowsHide: true, encoding: 'UTF-8' });
        if (result.includes('true')) {
            return docker_states.Running;
        }
    } catch {
        return docker_states.NotFound;
    }

    return docker_states.NotRunning;
}

function is_docker_running() {
    const { execSync } = require("child_process");
    try {
        execSync('docker container ls', { windowsHide: true, encoding: 'UTF-8', stdio: "ignore" });
        return true;
    } catch {
        return false;
    }
}

function start_docker() {
    const { execSync } = require("child_process");
    try {
        execSync('start "C:\Program Files\Docker\Docker\Docker Desktop.exe"', { windowsHide: true, encoding: 'utf8'});
        return true;
    } catch {
        return false;
    }
}

