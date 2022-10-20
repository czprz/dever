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
     * Check dependencies for powershell-script execution
     */
    check() {
        // Todo: Check if powershell is supported
        return this._success(Operation.DependencyCheck, true);
    }

    /**
     * Executes powershell script
     */
    async _execute(execute, runtime) {
        try {
            this._started(Operation.Executing);

            const file = path.join(execute.location, execute.file);
            const fileWithParameters = customOptions.addToFile(file, execute.options, runtime.args);
            await powershell.executeFileSync(fileWithParameters, execute.elevated);

            this._success(Operation.Executed);
        } catch (e) {
            this._error(Operation.Executed, e);
        }
    }
}

export const Operation = Object.freeze({Executing: 'executing', Executed: 'executed', DependencyCheck: 'dependency-check'});