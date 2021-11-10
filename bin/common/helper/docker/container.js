const docker_states = Object.freeze({"NotFound": 0, "Running": 1, "NotRunning": 2});

module.exports = {
    getRunState: get_run_state,
    create: create,
    start: start,
    stop: stop,
    remove: remove
}

const shell = require('../shell');

/**
 * Check if container is running
 * @param name {string}
 * @return {number}
 */
function get_run_state(name) {
    const {execSync} = require("child_process");
    try {
        const result = execSync(`docker container inspect -f '{{.State.Running}}' ${name}`, {
            windowsHide: true,
            encoding: 'UTF-8'
        });

        if (result.includes('true')) {
            return docker_states.Running;
        }

        return docker_states.NotRunning;
    } catch {
        return docker_states.NotFound;
    }
}

/**
 * Create docker container
 * @param obj {Container}
 */
function create(obj) {
    const envs = createVariables(obj.variables);
    const ports = createPortMappings(obj.ports);

    shell.executeSync(`docker run -d --name ${obj.name} ${ports} ${envs} ${obj.image}`);
}

/**
 * Start docker container
 * @param name {string}
 */
function start(name) {
    shell.executeSync(`docker container start ${name}`);
}

/**
 * Stop docker container
 * @param name {string}
 */
function stop(name) {
    shell.executeSync(`docker container stop ${name}`);
}

/**
 * Remove docker container
 * @param name {string}
 */
function remove(name) {
    stop(name);
    shell.executeSync(`docker container rm ${name}`);
}

/**
 * Create variables for docker creation
 * @param variables {string[]}
 * @return string
 */
function createVariables(variables) {
    if (variables == null || variables.length === 0) {
        return '';
    }

    let output = '';

    for (const variable of variables) {
        output += `--env ${variable} `;
    }

    return output.trim();
}

/**
 * Create port mappings for docker creation
 * @param ports {string[]}
 * @return string
 */
function createPortMappings(ports) {
    let output = '';

    for (const port of ports) {
        output += `-p ${port}`;
    }

    return output.trim();
}

class Container {
    /**
     * Name
     * @var {string}
     */
    name;

    /**
     * Port mappings
     * @var {string[]}
     */
    ports;

    /**
     * Environment variables
     * @var {string[]}
     */
    variables;

    /**
     * Name of docker image
     * @var {string}
     */
    image;
}
