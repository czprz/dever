import {Operation} from "../../executions/winget/index.js";
import {Informer, Status} from "../../models.js";

export default new class extends Informer {
    /**
     * Handles handlers for each environment dependency
     * @param log {ExecutionLog}
     * @param name {string}
     */
    inform(log, name) {
        switch (log.operation) {
            case Operation.Installing:
                this._inform_partial(`chocolatey: '${name}' is being installed... `, log);
                break;
            case Operation.Uninstalling:
                this._inform_partial(`chocolatey: '${name}' is being uninstalled... `, log);
                break;
            case Operation.Installed:
            case Operation.Uninstalled:
                this._inform_partial(log.status === Status.Success ? 'done' : 'failed', log);
                break;
            case Operation.DependencyCheck:
                break;
        }
    }
}