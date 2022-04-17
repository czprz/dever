const shell = require('../shell');
const {execSync} = require("child_process");

const docker_states = Object.freeze({"NotFound": 0, "Running": 1, "NotRunning": 2});

module.exports = new class {
    /**
     * Check if container is running
     * @param name {string}
     * @return {number}
     */
    getRunState(name) {
        try {
            const result = execSync(`docker container inspect -f '{{.State.Running}}' ${name}`, {
                windowsHide: true,
                encoding: 'UTF-8',
                stdio: ['ignore']
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
     * @param container {Container}
     */
    create(container) {
        const envs = this.#createVariables(container.variables);
        const ports = this.#createPortMappings(container.ports);

        shell.executeSync(`docker run -d --name ${container.name} ${ports} ${envs} ${container.image}`);
    }

    /**
     * Start docker container
     * @param name {string}
     */
    start(name) {
        shell.executeSync(`docker container start ${name}`);
    }

    /**
     * Stop docker container
     * @param name {string}
     */
    stop(name) {
        shell.executeSync(`docker container stop ${name}`);
    }

    /**
     * Remove docker container
     * @param name {string}
     */
    remove(name) {
        this.stop(name);
        shell.executeSync(`docker container rm ${name}`);
    }

    /**
     * Create variables for docker creation
     * @param variables {string[]}
     * @return {string}
     */
    #createVariables(variables) {
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
     * @return {string}
     */
    #createPortMappings(ports) {
        let output = '';

        for (const port of ports) {
            output += `-p ${port}`;
        }

        return output.trim();
    }
}
