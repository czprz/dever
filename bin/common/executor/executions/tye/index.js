import {ExecutionInterface} from "../../models.js";
import powershell from "../../../helper/powershell.js";

import {execSync} from "child_process";

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

            // TODO: Execute from the project root
            const command = 'tye run ' + execute.command;
            await powershell.executeSync(command, execute.elevated);

            this._success(Operation.Executed);
        } catch (e) {
            this._error(Operation.Executed, e);
        }
    }
}

export const Operation = Object.freeze({Executing: 'executing', Executed: 'executed', DependencyCheck: 'dependency-check'});