import powershell from '../../../helper/powershell.js';
import customOptions from '../../../helper/options/custom-options-applier.js';

import {ExecutionInterface} from "../../models.js";

"use strict";
export default new class extends ExecutionInterface {
    /**
     * Execution type
     * @type {string}
     * @private
     */
    _type = 'powershell-command';

    /**
     * Check dependencies for powershell-command execution
     */
    check() {
        // Todo: Check if powershell is available
        return this._success(Operation.DependencyCheck, true);
    }

    /**
     * Executes powershell command
     */
    async _execute(execute, runtime) {
        try {
            const command = customOptions.addToCommand(execute.command, execute.options, runtime.args);
            await powershell.executeSync(command, execute.elevated);

            this._success(Operation.Executed);
        } catch (e) {
            this._error(Operation.NotExecuted, e);
        }
    }
}

export const Operation = Object.freeze({Executed: 'executed', NotExecuted: 'not-executed',  DependencyCheck: 'dependency-check'});