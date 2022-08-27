import powershell from '../../../helper/powershell.js';
import customOptions from '../../../helper/options/custom-options-applier.js';

import {ExecutionInterface} from '../../models.js';

import path from 'path';

"use strict";
export default new class extends ExecutionInterface {
    /**
     * Execution type
     * @type {string}
     * @private
     */
    _type = 'powershell-script';
    
    /**
     * Handler for powershell-script execution
     */
    async handle(execute, runtime) {
        try {
            const file = path.join(execute.location, execute.file);
            const fileWithParameters = customOptions.addToFile(file, execute.options, runtime.args);
            await powershell.executeFileSync(fileWithParameters, execute.elevated);

            return this._success(Operation.Executed);
        } catch (e) {
            return this._error(Operation.NotExecuted, e);
        }
    }

    /**
     * Check dependencies for powershell-script execution
     */
    check() {
        // Todo: Check if powershell is supported
        return this._success(Operation.DependencyCheck);
    }
}

export const Operation = Object.freeze({Executed: 'executed', NotExecuted: 'not-executed', DependencyCheck: 'dependency-check'});