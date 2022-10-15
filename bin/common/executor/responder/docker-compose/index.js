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
            case Operation.Created:
                this._inform('success', `docker-compose: '${name}' has been created and started`);
                break;
            case Operation.Started:
                this._inform('success', `docker-compose: '${name}' has been started`);
                break;
            case Operation.Stopped:
                this._inform('success', `docker-compose: '${name}' has been stopped`);
                break;
            case Operation.Recreated:
                this._inform('success', `docker-compose: '${name}' has been recreated`);
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