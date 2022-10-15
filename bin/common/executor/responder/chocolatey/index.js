import {Operation} from "../../executions/chocolatey/index.js";
import {Informer} from "../../models.js";

export default new class extends Informer {
    /**
     * Handles handlers for each environment dependency
     * @param log {ExecutionLog}
     * @param name {string}
     */
    inform(log, name) {
        switch (log.operation) {
            case Operation.Install:
                this._inform('success', `chocolatey: '${name}' has been installed`);
                break;
            case Operation.NotInstall:
                this._inform('error', `chocolatey: '${name}' was not installed due to errors`);
                break;
            case Operation.Uninstall:
                this._inform('success', `chocolatey: '${name}' has been uninstalled`);
                break;
            case Operation.NotUninstall:
                this._inform('error', `chocolatey: '${name}' was not uninstalled due to errors`);
                break;
            case Operation.DependencyCheck:
                this._inform('error', `Chocolatey not installed. Please install chocolatey and retry command`);
                break;
        }
    }
}