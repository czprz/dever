import docker from '../../../helper/docker/index.js';

import {Runtime} from "../../../../execution/executor/runtime-mapper.js";
import {ExecutionInterface} from "../../models.js";

"use strict";
export default new class extends ExecutionInterface {
    /**
     * Execution type
     * @type {string}
     * @private
     */
    _type = 'docker-container';

    /**
     * Check dependencies for docker-container execution
     */
    check() {
        if (!docker.is_docker_running()) {
            return this._error(Operation.DependencyCheck, null, true);
        }

        return this._success(Operation.DependencyCheck, true);
    }

    /**
     * Executes docker-container command
     */
    async _execute(execute, runtime) {
        switch (true) {
            case runtime.up:
                this.#up(execute.container, runtime);
                break;
            case runtime.down:
                this.#down(execute.container);
                break;
        }
    }

    /**
     * Start docker container
     * @param container {Container}
     * @param runtime {Runtime}
     */
    #up(container, runtime) {
        try {
            const state = docker.container.getRunState(container.name);
            switch (state) {
                case docker.states.NotRunning: {
                    if (this.#recreate(container, runtime.clean)) {
                        this._success(Operation.Recreated);
                    }

                    this._started(Operation.Starting);
                    docker.container.start(container.name);
                    this._success(Operation.Started);
                    break;
                }
                case docker.states.Running:
                    if (this.#changed(container)) {
                        return;
                    }

                    this._success(Operation.AlreadyRunning);
                    break;
                case docker.states.NotFound: {
                    this._started(Operation.Creating);
                    docker.container.create(container);
                    this._success(Operation.Created);
                    break;
                }
            }
        } catch (e) {
            this._error(Operation.CouldNotCreateOrStart, e);
        }
    }

    /**
     * Stop docker container
     * @param container {Container}
     */
    #down(container) {
        try {
            const state = docker.container.getRunState(container.name);
            switch (state) {
                case docker.states.Running:
                    this._started(Operation.Stopping);
                    docker.container.stop(container.name);
                    this._success(Operation.Stopped);
                    break;
                case docker.states.NotFound:
                    this._success(Operation.NotFound);
                    break;
                case docker.states.NotRunning:
                    this._success(Operation.NotRunning);
                    break;
            }
        } catch (e) {
            this._error(Operation.CouldNotStop, e);
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

        this._started(Operation.Recreating);

        docker.container.remove(container.name);
        docker.container.create(container);

        return true;
    }

    /**
     * Check if container has changed
     * @param container {Container}
     * @return {boolean}
     */
    #changed(container) {
        const ports = docker.container.getPorts(container.name);
        const variables = docker.container.getVariables(container.name);

        if (container.image !== docker.container.getImage(container.name) ||
            ports.length !== container.ports.length || ports.some(x => !container.ports.includes(x)) ||
            variables.length !== container.variables.length || variables.some(x => !container.variables.includes(x))) {
            this._started(Operation.Changing);
            docker.container.remove(container.name);
            docker.container.create(container);
            this._success(Operation.Changed);

            return true;
        }

        return false;
    }
}

export const Operation = Object.freeze({
    'Starting': 'starting',
    'Started': 'started',
    'Stopping': 'stopping',
    'Stopped': 'stopped',
    'Recreating': 'recreating',
    'Recreated': 'recreated',
    'Creating': 'creating',
    'Created': 'created',
    'Changing': 'changing',
    'Changed': 'changed',
    'AlreadyRunning': 'already-running',
    'NotFound': 'not-found',
    'NotRunning': 'not-running',
    'DependencyCheck': 'dependency-check',
    'CouldNotCreateOrStart': 'could-not-create-or-start',
    'CouldNotStop': 'could-not-stop'
});