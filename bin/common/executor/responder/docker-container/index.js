import {Operation} from "../../executions/docker-container/index.js";
import {Informer, Status} from "../../models.js";

export default new class extends Informer {
    /**
     * Handles handlers for each environment dependency
     * @param log {ExecutionLog}
     * @param name {string}
     */
    inform(log, name) {
        switch (log.operation) {
            case Operation.Creating:
                this._inform_partial(`docker-container: '${name}' is being created... `, log);
                break;
            case Operation.Starting:
                this._inform_partial(`docker-container: '${name}' is being started... `, log);
                break;
            case Operation.Stopping:
                this._inform_partial(`docker-container: '${name}' is being stopped... `, log);
                break;
            case Operation.Recreating:
                this._inform_partial(`docker-container: '${name}' is being recreated... `, log);
                break;
            case Operation.Started:
            case Operation.Stopped:
            case Operation.Created:
            case Operation.Recreated:
            case Operation.CouldNotCreateOrStart:
            case Operation.CouldNotStop:
            case Operation.Changed:
                this._inform_partial(log.status === Status.Error ? `failed` : `done`, log);
                break;
            case Operation.Changing:
                this._inform_partial(`docker-container: '${name}' is being changed... `, log);
                break;
            case Operation.AlreadyRunning:
                this._inform('success', `docker-container: '${name}' is already running`);
                break;
            case Operation.NotFound:
                this._inform('success', `docker-container: '${name}' was not found`);
                break;
            case Operation.NotRunning:
                this._inform('success', `docker-container: '${name}' is not running`);
                break;
            case Operation.DependencyCheck:
                this._inform('error', `Docker engine not running. Please start docker and retry command`);
                break;
            default:
                break;
        }
    }
}