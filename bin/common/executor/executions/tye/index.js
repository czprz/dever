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
            execSync('tye', { windowsHide: true, encoding: 'UTF-8', stdio: "ignore" });
            return this._success(Operation.DependencyCheck, true);
        } catch {
            return this._error(Operation.DependencyCheck, null, true);
        }
    }

    /**
     * Executes tye
     */
    async _execute(execute, runtime) {
        try {
            this._started(Operation.Executing);

            let command = "tye";
            command = this.#addCommand(command, execute);
            command = this.#addConfigFiles(command, execute);

            await powershell.executeSync(command, execute.elevated);

            this._success(Operation.Executed);
        } catch (e) {
            this._error(Operation.Executed, e);
        }
    }

    /**
     * Adds config files to command
     * @param command {string}
     * @param execute {Execute}
     * @returns {string}
     */
    #addConfigFiles(command, execute) {
        const configs = execute.tyeOptions.files.map((file, i) => {
            const filePath = path.join(execute.location, file);
            return `--config "${filePath}"` + (i === execute.tyeOptions.files.length - 1 ? "" : " ");
        });
        return `${command} ${configs}`;
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

export const Operation = Object.freeze({Executing: 'executing', Executed: 'executed', DependencyCheck: 'dependency-check'});