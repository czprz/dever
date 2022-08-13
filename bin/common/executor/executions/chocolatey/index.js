import {ExecutionInterface} from "../../models.js";
import {Execute, Runtime} from '../../../models/dever-json/internal.js';
import shell from "../../../helper/shell.js";

"use strict";
export default new class extends ExecutionInterface {
    /**
     * Execution type
     * @type {string|null}
     * @internal
     */
    _type = 'chocolatey';

    /**
     * @param execute {Execute}
     * @param runtime {Runtime}
     * @returns {Promise<Result> | Result}
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
     * @return {Promise<Result> | Result}
     */
    check() {
        try {
            shell.executeSync(`choco`);
            return this._success(Operation.DependencyCheck);
        } catch {
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
        } catch {
            return this._error(Operation.NotInstall);
        }
    }

    #down(execute) {
        try {
            shell.executeSync(`choco uninstall ${execute.package} -y`);

            return this._success(Operation.Uninstall);
        } catch {
            return this._error(Operation.NotUninstall);
        }
    }
}

export const Operation = Object.freeze({Install: 'install', NotInstall: 'not-install', Uninstall: 'uninstall', NotUninstall: 'not-uninstall', DependencyCheck: 'dependency-check'});