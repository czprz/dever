import {Operation} from "../../executions/docker-container/index.js";
import {Informer} from "../../models.js";

export default new class extends Informer {
    /**
     * Handles handlers for each environment dependency
     * @param log {ExecutionLog}
     * @param name {string}
     */
    inform(log, name) {
        switch (log.operation) {
            case Operation.Executed:
                this._inform('success', `powershell-command: '${name}' has been executed`);
                break;
            case Operation.NotExecuted:
                this._inform('error', `powershell-command: '${name}' has been executed with errors`);
                break;
            default:
                break;
        }
    }
}