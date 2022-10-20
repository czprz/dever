import shell from "../../../helper/shell.js";

import {Runtime} from "../../../../execution/executor/runtime-mapper.js";
import {Execute} from "../../../../execution/executor/action-mapper.js";
import {ExecutionInterface} from "../../models.js";

"use strict";
export default new class extends ExecutionInterface {
    /**
     * Execution type
     * @type {string|null}
     * @internal
     */
    _type = 'chocolatey';

    /**
     * Check if all necessary dependencies are available
     */
    check() {
        try {
            shell.executeSync(`choco -?`);
            return this._success(Operation.DependencyCheck);
        } catch (e) {
            return this._error(Operation.DependencyCheck);
        }
    }

    /**
     * Executes chocolatey command
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
     * Installs chocolatey package
     * @param execute {Execute}
     * @param runtime {Runtime}
     */
    #up(execute, runtime) {
        try {
            this._started(Operation.Installing);

            shell.executeSync(`choco install ${execute.package} -y`);

            this._success(Operation.Installed);
        } catch (error) {
            this._error(Operation.Installed, error);
        }
    }

    /**
     * Uninstalls chocolatey package
     * @param execute {Execute}
     */
    #down(execute) {
        try {
            this._started(Operation.Uninstalling);

            shell.executeSync(`choco uninstall ${execute.package} -y`);

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