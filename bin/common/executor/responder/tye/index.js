import {Informer, Status} from "../../models.js";
import {Operation} from "../../executions/tye/index.js";

export default new class extends Informer {
    /**
     * Handles handlers for each environment dependency
     * @param log {ExecutionLog}
     * @param name {string}
     */
    inform(log, name) {
        switch (log.operation) {
            case Operation.Starting:
                this._inform_partial(`tye: '${name}' is being started... `, log);
                break;
            case Operation.Stopping:
                this._inform_partial(`tye: '${name}' is being stopped... `, log);
                break;
            case Operation.Started:
            case Operation.Stopped:
                this._inform_partial(log.status === Status.Error ? `failed` : `done`, log);
                break;
            case Operation.CheckIfTyeIsInstalled:
                this._inform('error', `Tye command not available. Please install tye.`);
                break;
            case Operation.CheckIfDockerIsRunning:
                this._inform('error', `Docker engine not running. Please start docker and retry command.`);
                break;
            default:
                break;
        }
    }
}