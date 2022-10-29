import shell from "../../../helper/shell.js";
import chocolatey from "../../../helper/chocolatey.js";

import {Runtime} from "../../../../execution/executor/runtime-mapper.js";
import {Execute} from "../../../../execution/executor/action-mapper.js";
import {ExecutionInterface} from "../../models.js";
import {lastValueFrom} from "rxjs";

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

    async _install() {
        const install$ = chocolatey.logger;
        const lastValueFromInstall$ = lastValueFrom(install$)
        install$.subscribe(x => {
            switch (x.state) {
                case 'Started':
                    this._started(Operation.DependencyInstallStarted);
                    break;
            }
        });

        await chocolatey.install();

        const lastValue = await lastValueFromInstall$;

        switch (lastValue.state) {
            case 'Success':
                return this._success(Operation.DependencyInstallFinished);
            case 'Error':
                return this._error(Operation.DependencyInstallFinished, lastValue.error);
            case 'NotElevated':
                return this._warning(Operation.DependencyInstallNotElevated);
            case 'Skipped':
                return this._warning(Operation.DependencyInstallSkipped);
            default:
                return this._error(Operation.DependencyInstallFinished, new Error(`Unknown state: ${lastValue.state}`));
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
    DependencyInstallNotElevated: 'dependency-install-not-elevated',
    DependencyInstallStarted: 'dependency-install-started',
    DependencyInstallSkipped: 'dependency-install-skipped',
    DependencyInstallFinished: 'dependency-install-finished',
    DependencyCheck: 'dependency-check'
});