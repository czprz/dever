import docker from '../../../helper/docker/index.js';

import {Runtime} from "../../../../new_executor/runtime-mapper.js";
import {ExecutionInterface, Result} from "../../models.js";

"use strict";
export default new class extends ExecutionInterface {
    /**
     * Execution type
     * @type {string}
     * @private
     */
    _type = 'docker-container';

    /**
     * Handler for docker-container execution
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
     * Check dependencies for docker-container execution
     */
    check() {
        if (!docker.is_docker_running()) {
            return this._error(Operation.DependencyCheck);
        }

        return this._success(Operation.DependencyCheck);
    }

    /**
     * Start docker container
     * @param container {Container}
     * @param runtime {Runtime}
     * @returns {Result}
     */
    #up(container, runtime) {
        const state = docker.container.getRunState(container.name);
        switch (state) {
            case docker.states.NotRunning: {
                if (this.#recreate(container, runtime.clean)) {
                    return this._success(Operation.Recreated);
                }

                docker.container.start(container.name);

                return this._success(Operation.Started);
            }
            case docker.states.Running:
                return this._success(Operation.AlreadyRunning);
            case docker.states.NotFound:
                docker.container.create(container);
                return this._success(Operation.Created);
        }
    }

    /**
     * Stop docker container
     * @param container {Container}
     * @return {Result}
     */
    #down(container) {
        const state = docker.container.getRunState(container.name);
        switch (state) {
            case docker.states.Running:
                docker.container.stop(container.name);
                return this._success(Operation.Stopped);
            case docker.states.NotFound:
                return this._success(Operation.NotFound);
            case docker.states.NotRunning:
                return this._success(Operation.NotRunning);
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

export const Operation = Object.freeze({'Started': 'started', 'Stopped': 'stopped', 'Created': 'created', 'Recreated': 'recreated', 'AlreadyRunning': 'already-running', 'NotFound': 'not-found', 'NotRunning': 'not-running', 'DependencyCheck': 'dependency-check'});