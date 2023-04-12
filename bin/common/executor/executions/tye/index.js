import {ExecutionInterface} from "../../models.js";
import powershell from "../../../helper/powershell.js";

import {execSync} from "child_process";
import path from "path";

"use strict";
export default new class extends ExecutionInterface {
    /**
     * Execution type
     * @type {string}
     * @private
     */
    _type = 'tye';

    /**
     * Check dependencies for tye execution
     */
    check() {
        try {
            execSync('tye -?', { windowsHide: true, encoding: 'UTF-8', stdio: "ignore" });
            return this._success(Operation.DependencyCheck, true);
        } catch {
            return this._error(Operation.DependencyCheck, null, true);
        }
    }

    /**
     * Executes tye
     */
    async _execute(execute, runtime) {
        const start = runtime.up ? Operation.Starting : Operation.Stopping;
        const end = runtime.up ? Operation.Started : Operation.Stopped;

        try {
            this._started(start);

            let command = "tye";
            // TODO: Change execution location to be the root of the project
            command = this.#addCommand(command, execute);
            command = this.#addConfigFiles(command, execute);

            // TODO: Check if project tye works without config file
            // TODO: Might need to run in a new window
            await powershell.executeSync(command, execute.elevated);

            this._success(end);
        } catch (e) {
            this._error(end, e);
        }
    }

    /**
     * Adds config files to command
     * @param command {string}
     * @param execute {Execute}
     * @returns {string}
     */
    #addConfigFiles(command, execute) {
        if (!execute.tyeOptions.files || execute.tyeOptions.files.length === 0) {
            return command;
        }

        const filePath = path.join(execute.location, execute.tyeOptions.file);
        return `${command} ${filePath}`;
    }

    /**
     * Adds command to tye command
     * @param command {string}
     * @param execute {Execute}
     * @returns {string}
     */
    #addCommand(command, execute) {
        return `${command} ${execute.tyeOptions.command}`;
    }
}

export const Operation = Object.freeze({Starting: 'starting', Started: 'started', Stopping: 'stopping', Stopped: 'stopped', DependencyCheck: 'dependency-check'});