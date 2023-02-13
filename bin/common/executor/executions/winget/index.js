import shell from "../../../helper/shell.js";

import {Runtime} from "../../../../execution/executor/runtime-mapper.js";
import {Execute} from "../../../../execution/executor/action-mapper.js";
import {ExecutionInterface} from "../../models.js";

export default new class extends ExecutionInterface {
    /**
     * Execution type
     * @type {string}
     * @private
     */
    _type = 'winget';

    /**
     * Check dependencies for winget execution
     */
    check() {
        // Todo: Check if winget is supported
        return this._success(Operation.DependencyCheck, true);
    }

    /**
     * Execute winget command
     */
    async _execute(execute, runtime) {
        switch (true) {
            case runtime.up:
                this.#up(execute, runtime);
                break;
            case runtime.down:
                this.#down(execute);
                break;
        }
    }

    /**
     * Installs winget package
     * @param execute {Execute}
     * @param runtime {Runtime}
     */
    #up(execute, runtime) {
        try {
            this._started(Operation.Installing);

            shell.executeSync(`winget install ${execute.package} --silent`);

            this._success(Operation.Installed);
        } catch (error) {
            this._error(Operation.Installed, error);
        }
    }

    /**
     * Uninstalls winget package
     * @param execute {Execute}
     */
    #down(execute) {
        try {
            this._started(Operation.Uninstalling);

            shell.executeSync(`winget uninstall ${execute.package} --silent`);

            this._success(Operation.Uninstalled);
        } catch (error) {
            this._error(Operation.Uninstalled, error);
        }
    }
}

export const Operation = Object.freeze({
    Installing: 'installing',
    Installed: 'installed',
    Uninstalling: 'uninstalling',
    Uninstalled: 'uninstalled',
    DependencyCheck: 'dependency-check'
});