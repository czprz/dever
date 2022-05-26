import docker from '../../../common/helper/docker/index.js';
import shell from '../../../common/helper/shell.js';

import {execSync} from 'child_process';
import path from 'path';

const states = Object.freeze({"NotFound": 0, "Running": 1, "NotRunning": 2});

"use strict";
export default new class {
    /**
     * Handle starting and stopping of docker-compose
     * @param project {Config} Project configuration
     * @param execution {Execution} Dependency options
     * @param runtime {Runtime} shell arguments
     */
    handle(project, execution, runtime) {
        switch (true) {
            case runtime.start:
                this.#start(project, execution, runtime);
                break;
            case runtime.stop:
                this.#stop(project, execution);
                break;
        }
    }

    /**
     * Check if docker-compose dependencies are available
     * @returns {boolean}
     */
    check() {
        if (!docker.is_docker_running()) {
            console.error(`Docker engine not running. Please start docker and retry command`);
            return false;
        }

        return true;
    }

    /**
     * Start docker-compose
     * @param component {Config} Component configuration
     * @param execution {Execution} FilePath to docker-compose
     * @param runtime {Runtime}
     */
    #start(component, execution, runtime) {
        const state = this.#run_state();
        switch (state) {
            case states.NotRunning: {
                if (this.#recreate(component, execution.file, execution.name, runtime.clean)) {
                    return;
                }

                const filePath = path.join(component.location, execution.file);
                shell.executeSync(`docker-compose --file "${filePath}" --project-name dever up -d`);
                break;
            }
            case states.Running: {
                if (this.#recreate(component, execution.file, execution.name, runtime.clean)) {
                    return;
                }

                console.log(`docker-compose: '${execution.name}' already running!`);
                break;
            }
            case states.NotFound: {
                const filePath = path.join(component.location, execution.file);
                shell.executeSync(`docker-compose --file "${filePath}" --project-name dever up -d`);
                console.log(`docker-compose: '${execution.name}' created successfully`);
                break;
            }
        }
    }

    /**
     * Handles recreating of docker-compose
     * @param component {Config} Component configuration
     * @param file {string} FilePath of docker-compose.yml
     * @param name {string} Name of docker-compose sequence
     * @param clean {boolean} Indicate whether it should docker-compose should be recreated
     */
    #recreate(component, file, name, clean) {
        if (!clean) {
            return false;
        }

        const filePath = path.join(component.location, file);
        shell.executeSync(`docker-compose --file "${filePath}" --project-name dever up -d --force-recreate`);

        console.log(`docker-compose: '${name}' recreated successfully`);

        return true;
    }

    /**
     * Stop docker-compose
     * @param component {Config} Component configuration
     * @param execution {Execution} FilePath to docker-compose
     */
    #stop(component, execution) {
        const filePath = path.join(component.location, execution.file);
        shell.executeSync(`docker-compose --file "${filePath}" --project-name dever down`);

        console.log(`docker-compose: '${execution.name}' stopped successfully`);
    }

    /**
     * Check if docker-compose is running
     * @returns {Readonly<{NotRunning: number, Running: number, NotFound: number}>|number}
     */
    #run_state() {
        try {
            const result = execSync(`docker-compose -p dever ps`, {
                windowsHide: true,
                encoding: 'UTF-8'
            });

            if (result.includes('Exit 0')) {
                return states.NotRunning;
            }

            return result.includes('Up') ? states.Running : states.NotFound;
        } catch {
            return states.NotFound;
        }
    }
}