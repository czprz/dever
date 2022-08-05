import powershell from '../../../helper/powershell.js';
import customOptions from '../../../helper/custom_options.js';

import {Execute, Runtime} from "../../../models/dever-json/internal.js";
import {ExecutionInterface, Result} from "../../models.js";

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
     * @param execute {Execute}
     * @param runtime {Runtime}
     * @return {Promise<Result>}
     */
    async handle(execute, runtime) {
        try {
            const command = customOptions.addOptionsToCommand(execute.command, execute.options, runtime.args);
            await powershell.executeSync(command, execute.runAsElevated);

            return this._success(Operation.Executed);
        } catch (e) {
            return this._error(Operation.NotExecuted, e);
        }
    }

    /**
     * Check dependencies for powershell-command execution
     * @return {Result}
     */
    check() {
        // Todo: Check if powershell is supported
        return this._success(Operation.DependencyCheck);
    }
}

export const Operation = Object.freeze({Executed: 'executed', NotExecuted: 'not-executed',  DependencyCheck: 'dependency-check'});