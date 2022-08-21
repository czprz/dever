import powershell from '../../../helper/powershell.js';
import customOptions from '../../../helper/options/custom-options-creator.js';

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
     * Handler for powershell-command execution
     */
    async handle(execute, runtime) {
        try {
            const command = customOptions.addToCommand(execute.command, execute.options, runtime.args);
            await powershell.executeSync(command, execute.elevated);

            return this._success(Operation.Executed);
        } catch (e) {
            return this._error(Operation.NotExecuted, e);
        }
    }

    /**
     * Check dependencies for powershell-command execution
     */
    check() {
        // Todo: Check if powershell is available
        return this._success(Operation.DependencyCheck);
    }
}

export const Operation = Object.freeze({Executed: 'executed', NotExecuted: 'not-executed',  DependencyCheck: 'dependency-check'});