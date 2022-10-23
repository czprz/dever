import docker from '../../../helper/docker/index.js';
import shell from '../../../helper/shell.js';

import {Runtime} from "../../../../execution/executor/runtime-mapper.js";
import {Execute} from "../../../../execution/executor/action-mapper.js";
import {ExecutionInterface} from "../../models.js";

import {execSync} from 'child_process';
import path from 'path';

const states = Object.freeze({"NotFound": 0, "Running": 1, "NotRunning": 2});

"use strict";
export default new class extends ExecutionInterface {
    /**
     * Execution type
     * @type {string}
     * @private
     */
    _type = 'docker-compose';

    /**
     * Check dependencies for docker-compose execution
     */
    check() {
        if (!docker.is_docker_running()) {
            return this._error(Operation.DependencyCheck, null, true);
        }

        return this._success(Operation.DependencyCheck, true);
    }

    /**
     * Executes docker-compose command
     */
    async _execute(execute, runtime) {
        switch (true) {
            case runtime.up:
                this.#up(execute, runtime);
                break;
            case runtime.down:
                this.#down(execute);
                break;
        }
    }

    /**
     * Start docker-compose
     * @param execute {Execute}
     * @param runtime {Runtime}
     */
    #up(execute, runtime) {
        try {
            const state = this.#run_state();

            switch (state) {
                case states.NotRunning: {
                    if (this.#recreate(execute.location, execute.file, runtime.clean)) {
                        this._success(Operation.Recreated);
                        return;
                    }

                    this._started(Operation.Starting);

                    const filePath = path.join(execute.location, execute.file);
                    shell.executeSync(`docker-compose --file "${filePath}" --project-name dever up -d`);

                    this._success(Operation.Started);
                    break;
                }
                case states.Running: {
                    if (this.#recreate(execute.location, execute.file, runtime.clean)) {
                        this._success(Operation.Recreated);
                        return;
                    }

                    this._success(Operation.AlreadyRunning);
                    break;
                }
                case states.NotFound: {
                    this._started(Operation.Creating);

                    const filePath = path.join(execute.location, execute.file);
                    shell.executeSync(`docker-compose --file "${filePath}" --project-name dever up -d`);

                    this._success(Operation.Created);
                    break;
                }
            }
        } catch (e) {
            this._error(Operation.CouldNotCreateOrStart, e);
        }
    }

    /**
     * Stop docker-compose
     * @param execute {Execute}
     */
    #down(execute) {
        try {
            this._started(Operation.Stopping);

            const filePath = path.join(execute.location, execute.file);
            shell.executeSync(`docker-compose --file "${filePath}" --project-name dever down`);

            this._success(Operation.Stopped);
        } catch (e) {
            this._error(Operation.Stopped, e);
        }
    }

    /**
     * Handles recreating of docker-compose
     * @param location {string}
     * @param file {string}
     * @param clean {boolean}
     */
    #recreate(location, file, clean) {
        if (!clean) {
            return false;
        }

        this._started(Operation.Recreating);

        const filePath = path.join(location, file);
        shell.executeSync(`docker-compose --file "${filePath}" --project-name dever up -d --force-recreate`);

        return true;
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

export const Operation = Object.freeze({
    'Starting': 'starting',
    'Started': 'started',
    'Stopping': 'stopping',
    'Stopped': 'stopped',
    'Creating': 'creating',
    'Created': 'created',
    'Recreating': 'recreating',
    'Recreated': 'recreated',
    'AlreadyRunning': 'already-running',
    'DependencyCheck': 'dependency-check',
    'CouldNotCreateOrStart': 'could-not-create-or-start',
    'CouldNotStop': 'could-not-stop',
});