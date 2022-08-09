import powershell from '../../../helper/powershell.js';
import customOptions from '../../../helper/custom_options.js';

import {Execute, Runtime} from '../../../models/dever-json/internal.js';
import {ExecutionInterface, Result} from '../../models.js';

import path from 'path';

"use strict";
export default new class extends ExecutionInterface {
    /**
     * Execution type
     * @type {string}
     * @private
     */
    _type = 'powershell-command';
    
    /**
     * Handler for powershell-script execution
     * @param execute {Execute}
     * @param runtime {Runtime}
     * @return {Promise<Result>}
     */
    async handle(execute, runtime) {
        try {
            const file = path.join(execute.location, execute.file);
            const fileWithParameters = customOptions.addOptionsToFile(file, execute.options, runtime.args);
            await powershell.executeFileSync(fileWithParameters, execute.runAsElevated);

            return this._success(Operation.Executed);
        } catch (e) {
            return this._error(Operation.NotExecuted, e);
        }
    }

    /**
     * Check dependencies for powershell-script execution
     * @return {Result}
     */
    check() {
        // Todo: Check if powershell is supported
        return this._success(Operation.DependencyCheck);
    }
}

export const Operation = Object.freeze({Executed: 'executed', NotExecuted: 'not-executed', DependencyCheck: 'dependency-check'});