import docker from '../../../helper/docker/index.js';

import {Execute, Runtime} from "../../../models/dever-json/internal.js";
import {ExecutionResult, Status} from "../../models.js";

"use strict";
export default new class {
    /**
     * Handle starting and stopping of docker containers
     * @param execute {Execute}
     * @param runtime {Runtime}
     * @returns {ExecutionResult}
     */
    handle(execute, runtime) {
        switch(true) {
            case runtime.up:
                return this.#up(execute.container, runtime);
            case runtime.down:
                return this.#down(execute.container);
        }
    }

    /**
     * Check if docker-container dependencies are available
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
     * Start docker container
     * @param container {Container}
     * @param runtime {Runtime}
     * @returns {ExecutionResult}
     */
    #up(container, runtime) {
        const state = docker.container.getRunState(container.name);
        switch (state) {
            case docker.states.NotRunning: {
                if (this.#recreate(container, runtime.clean)) {
                    return new ExecutionResult(Status.Success, Operation.Recreated);
                }

                docker.container.start(container.name);

                return new ExecutionResult(Status.Success, Operation.Started);
            }
            case docker.states.Running:
                return new ExecutionResult(Status.Success, Operation.AlreadyRunning);
            case docker.states.NotFound:
                docker.container.create(container);

                return new ExecutionResult(Status.Success, Operation.Created);
        }
    }

    /**
     * Stop docker container
     * @param container {Container}
     * @return {ExecutionResult}
     */
    #down(container) {
        const state = docker.container.getRunState(container.name);
        switch (state) {
            case docker.states.Running:
                docker.container.stop(container.name);
                return new ExecutionResult(Status.Success, Operation.Stopped);
            case docker.states.NotFound:
                return new ExecutionResult(Status.Success, Operation.NotFound);
            case docker.states.NotRunning:
                return new ExecutionResult(Status.Success, Operation.NotRunning);
        }
    }

    /**
     * Recreated docker container
     * @param container {Container}
     * @param clean {boolean}
     */
    #recreate(container, clean) {
        if (!clean) {
            return false;
        }

        docker.container.remove(container.name);
        docker.container.create(container);

        return true;
    }
}

export const Operation = Object.freeze({'Started': 'started', 'Stopped': 'stopped', 'Created': 'created', 'Recreated': 'recreated', 'AlreadyRunning': 'already-running', 'NotFound': 'not-found', 'NotRunning': 'not-running'});