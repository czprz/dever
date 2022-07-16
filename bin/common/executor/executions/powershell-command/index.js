import powershell from '../../../helper/powershell.js';
import customOptions from '../../../helper/custom_options.js';

import {Execute, Runtime} from "../../../models/dever-json/internal.js";
import {CheckResult, ExecutionInterface, ExecutionResult, Status} from "../../models.js";

"use strict";
export default new class extends ExecutionInterface {
    /**
     * Handler for powershell-command execution
     * @param execute {Execute}
     * @param runtime {Runtime}
     * @return {Promise<ExecutionResult>}
     */
    async handle(execute, runtime) {
        try {
            const command = customOptions.addOptionsToCommand(execute.command, execute.options, runtime.args);
            await powershell.executeSync(command, execute.runAsElevated);

            return new ExecutionResult(Status.Success, Operation.Executed);
        } catch (e) {
            return new ExecutionResult(Status.Error, Operation.Executed, e);
        }
    }

    /**
     * Check dependencies for powershell-command execution
     * @return {CheckResult}
     */
    check() {
        // Todo: Check if powershell is supported
        return new CheckResult(Status.Success, Operation.DependencyCheck);
    }
}

export const Operation = Object.freeze({Executed: 'executed', DependencyCheck: 'dependency-check'});