import {Operation} from "../../executions/powershell-script/index.js";
import {Informer, Status} from "../../models.js";

export default new class extends Informer {
    /**
     * Handles handlers for each environment dependency
     * @param log {ExecutionLog}
     * @param name {string}
     */
    inform(log, name) {
        switch (log.operation) {
            case Operation.Executing:
                this._inform_partial(`powershell-script: '${name}' is being executed... `, log);
                break;
            case Operation.Executed:
                this._inform_partial(log.status === Status.Success ? 'done' : 'failed', log);
                break;
            default:
                break;
        }
    }
}