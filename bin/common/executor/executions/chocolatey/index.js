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
     * Handler for chocolatey execution
     */
    handle(execute, runtime) {
        switch (true) {
            case runtime.up:
                return this.#up(execute, runtime);
            case runtime.down:
                return this.#down(execute);
        }
    }

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
     * Run chocolatey
     * @param execute {Execute}
     * @param runtime {Runtime}
     * @returns {Result}
     */
    #up(execute, runtime) {
        try {
            shell.executeSync(`choco install ${execute.package} -y`);

            return this._success(Operation.Install);
        } catch (error) {
            return this._error(Operation.NotInstall, error);
        }
    }

    #down(execute) {
        try {
            shell.executeSync(`choco uninstall ${execute.package} -y`);

            return this._success(Operation.Uninstall);
        } catch (error) {
            return this._error(Operation.NotUninstall, error);
        }
    }
}

export const Operation = Object.freeze({Install: 'install', NotInstall: 'not-install', Uninstall: 'uninstall', NotUninstall: 'not-uninstall', DependencyCheck: 'dependency-check'});