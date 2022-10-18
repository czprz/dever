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
     * Executes chocolatey
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
     * Run chocolatey
     * @param execute {Execute}
     * @param runtime {Runtime}
     * @returns {ExecutionLog}
     */
    #up(execute, runtime) {
        try {
            this._started(Operation.Installing);
            shell.executeSync(`choco install ${execute.package} -y`);

            this._success(Operation.Installed);
        } catch (error) {
            this._error(Operation.NotInstall, error);
        }
    }

    #down(execute) {
        try {
            this._started(Operation.Uninstalling);

            shell.executeSync(`choco uninstall ${execute.package} -y`);

            this._success(Operation.Uninstall);
        } catch (error) {
            this._error(Operation.NotUninstall, error);
        }
    }
}

export const Operation = Object.freeze({
    Installing: 'installing',
    Installed: 'installed',
    NotInstall: 'not-install',
    Uninstalling: 'uninstalling',
    Uninstall: 'uninstall',
    NotUninstall: 'not-uninstall',
    DependencyCheck: 'dependency-check'
});