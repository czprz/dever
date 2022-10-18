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
            case Operation.Installing:
                this._inform_partial(`chocolatey: '${name}' is being installed... `);
                break;
            case Operation.Installed:
                this._inform_partial('done', true, false);
                break;
            case Operation.NotInstall:
                this._inform_partial('failed', true, true);
                break;
            case Operation.Uninstalling:
                this._inform_partial(`chocolatey: '${name}' is being uninstalled... `);
                break;
            case Operation.Uninstall:
                this._inform_partial('done', true, false);
                break;
            case Operation.NotUninstall:
                this._inform_partial('failed', true, true);
                break;
            case Operation.DependencyCheck:
                this._inform('error', `Chocolatey not installed. Please install chocolatey and retry command`);
                break;
        }
    }
}