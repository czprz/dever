import {Operation} from "../../executions/docker-compose/index.js";
import {Informer} from "../../models.js";

export default new class extends Informer {
    /**
     * Handles handlers for each environment dependency
     * @param log {ExecutionLog}
     * @param name {string}
     */
    inform(log, name) {
        switch (log.operation) {
            case Operation.Creating:
                this._inform_partial(`docker-compose: '${name}' is being created... `, log);
                break;
            case Operation.Created:
                this._inform_partial('done', log);
                break;
            case Operation.Starting:
                this._inform_partial(`docker-compose: '${name}' is being started... `, log);
                break;
            case Operation.Started:
                this._inform_partial('done', log);
                break;
            case Operation.Stopping:
                this._inform_partial(`docker-compose: '${name}' is being stopped... `, log);
                break;
            case Operation.Stopped:
                this._inform_partial('done', log);
                break;
            case Operation.NotStopped:
                this._inform_partial('failed', log);
                break;
            case Operation.Recreating:
                this._inform_partial(`docker-compose: '${name}' is being recreated... `, log);
                break;
            case Operation.Recreated:
                this._inform_partial('done', log);
                break;
            case Operation.AlreadyRunning:
                this._inform('success', `docker-compose: '${name}' is already running`);
                break;
            case Operation.DependencyCheck:
                this._inform('error', `docker-compose: '${name}' is not running`);
                break;
            default:
                break;
        }
    }
}