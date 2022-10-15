import {Operation} from "../../executions/docker-container/index.js";
import {Informer, Status} from "../../models.js";

export default new class extends Informer {
    /**
     * Handles handlers for each environment dependency
     * @param log {ExecutionLog}
     * @param name {string}
     */
    inform(log, name) {
        const message = log.status === Status.Error ? `failed` : `done`;

        switch (log.operation) {
            case Operation.Creating:
                this._inform_partial(`docker-container: '${name}' is being created... `);
                break;
            case Operation.Created:
                this._inform_partial(message, true, log.status === Status.Error);
                break;
            case Operation.Starting:
                this._inform_partial(`docker-container: '${name}' is being started... `);
                break;
            case Operation.Started:
                this._inform_partial(message, true, log.status === Status.Error);
                break;
            case Operation.Stopping:
                this._inform_partial(`docker-container: '${name}' is being stopped... `);
                break;
            case Operation.Stopped:
                this._inform_partial(message, true, log.status === Status.Error);
                break;
            case Operation.Recreating:
                this._inform_partial(`docker-container: '${name}' is being recreated... `);
                break;
            case Operation.Recreated:
                this._inform_partial(message, true, log.status === Status.Error);
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