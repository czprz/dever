import docker from '../../../helper/docker/index.js';
import shell from '../../../helper/shell.js';

import {Runtime} from "../../../../execution/executor/runtime-mapper.js";
import {Execute} from "../../../../execution/executor/action-mapper.js";
import {Result, ExecutionInterface} from "../../models.js";

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
     * Handler for docker-compose execution
     */
    handle(execute, runtime) {
        switch (true) {
            case runtime.up:
                return this.#up(execute, runtime);
            case runtime.down:
                return this.#down(execute);
        }
    }

    /**
     * Check dependencies for docker-compose execution
     */
    check() {
        if (!docker.is_docker_running()) {
            return this._error(Operation.DependencyCheck);
        }

        return this._success(Operation.DependencyCheck);
    }

    /**
     * Start docker-compose
     * @param execute {Execute} FilePath to docker-compose
     * @param runtime {Runtime}
     * @returns {Result}
     */
    #up(execute, runtime) {
        try {
            const state = this.#run_state();

            switch (state) {
                case states.NotRunning: {
                    if (this.#recreate(execute.location, execute.file, runtime.clean)) {
                        return this._success(Operation.Recreated);
                    }

                    const filePath = path.join(execute.location, execute.file);
                    shell.executeSync(`docker-compose --file "${filePath}" --project-name dever up -d`);

                    return this._success(Operation.Started);
                }
                case states.Running: {
                    if (this.#recreate(execute.location, execute.file, runtime.clean)) {
                        return this._success(Operation.Recreated);
                    }

                    return this._success(Operation.AlreadyRunning);
                }
                case states.NotFound: {
                    const filePath = path.join(execute.location, execute.file);
                    shell.executeSync(`docker-compose --file "${filePath}" --project-name dever up -d`);

                    return this._success(Operation.Started);
                }
            }
        } catch (e) {
            return this._error(Operation.CouldNotCreateOrStart, e);
        }
    }

    /**
     * Stop docker-compose
     * @param execute {Execute} FilePath to docker-compose
     * @returns {Result}
     */
    #down(execute) {
        try {
            const filePath = path.join(execute.location, execute.file);
            shell.executeSync(`docker-compose --file "${filePath}" --project-name dever down`);

            return this._success(Operation.Stopped);
        } catch (e) {
            return this._error(Operation.CouldNotStop, e);
        }
    }

    /**
     * Handles recreating of docker-compose
     * @param location {string} Project location
     * @param file {string} FilePath of docker-compose.yml
     * @param clean {boolean} Indicate whether it should docker-compose should be recreated
     */
    #recreate(location, file, clean) {
        if (!clean) {
            return false;
        }

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
    'Started': 'started',
    'Stopped': 'stopped',
    'Created': 'created',
    'Recreated': 'recreated',
    'AlreadyRunning': 'already-running',
    'DependencyCheck': 'dependency-check',
    'CouldNotCreateOrStart': 'could-not-create-or-start',
    'CouldNotStop': 'could-not-stop',
});