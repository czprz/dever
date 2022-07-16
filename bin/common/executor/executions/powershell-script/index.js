import powershell from '../../../helper/powershell.js';
import customOptions from '../../../helper/custom_options.js';

import {Execute, Runtime} from '../../../models/dever-json/internal.js';
import {CheckResult, ExecutionInterface, ExecutionResult, Status} from '../../models.js';

import path from 'path';

"use strict";
export default new class extends ExecutionInterface {
    /**
     * Handler for powershell-script execution
     * @param execute {Execute}
     * @param runtime {Runtime}
     * @return {Promise<ExecutionResult>}
     */
    async handle(execute, runtime) {
        try {
            const file = path.join(execute.location, execute.file);
            const fileWithParameters = customOptions.addOptionsToFile(file, execute.options, runtime.args);
            await powershell.executeFileSync(fileWithParameters, execute.runAsElevated);

            return new ExecutionResult(Status.Success, Operation.Executed);
        } catch (e) {
            return new ExecutionResult(Status.Error, Operation.Executed, e);
        }
    }

    /**
     * Check dependencies for powershell-script execution
     * @return {CheckResult}
     */
    check() {
        // Todo: Check if powershell is supported
        return new CheckResult(Status.Success, Operation.DependencyCheck);
    }
}

export const Operation = Object.freeze({Executed: 'executed', DependencyCheck: 'dependency-check'});