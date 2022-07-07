import shell from '../shell.js';

import {execSync} from 'child_process';

const docker_states = Object.freeze({"NotFound": 0, "Running": 1, "NotRunning": 2});

"use strict";
export default new class {
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
     * Get container image name
     * @param name {string}
     * @returns {string}
     */
    getImage(name) {
        const image = execSync(`docker container inspect ${name} --format='{{.Config.Image}}'`, {
            windowsHide: true,
            encoding: 'UTF-8',
            stdio: ['ignore']
        });

        return image?.trim().replace(/'/g, '');
    }

    /**
     * Get environment variables from container
     * @param name {string}
     * @returns {string[]}
     */
    getEnvironmentVariables(name) {
        const variables = execSync(`docker container inspect ${name} --format='{{.Config.Env}}'`, {
            windowsHide: true,
            encoding: 'UTF-8',
            stdio: ['ignore']
        });

        return variables?.trim().replace(/'|\[|]/g, '').split(' ');
    }

    /**
     * Get container port mappings
     * @param name {string}
     * @returns {string[]}
     */
    getPorts(name) {
        const unmappedPorts = execSync(`docker container inspect ${name} --format='{{.NetworkSettings.Ports}}'`, {
            windowsHide: true,
            encoding: 'UTF-8',
            stdio: ['ignore']
        });

        const re = new RegExp('(?<internal>\\d+)\\/(?:tcp|udp)\:\\[{\\d+.\\d+.\\d+.\\d+ (?<assigned>\\d+)}]', 'g');

        let ports = [];
        let values = [];
        while ((values = re.exec(unmappedPorts)) !== null) {
            ports.push(`${values.groups.assigned}:${values.groups.internal}`);
        }

        return ports;
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
        let output = '';

        if (variables == null || variables.length === 0) {
            return output;
        }

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

        if (ports == null || ports.length === 0) {
            return output;
        }

        for (const port of ports) {
            output += `-p ${port} `;
        }

        return output.trim();
    }
}
