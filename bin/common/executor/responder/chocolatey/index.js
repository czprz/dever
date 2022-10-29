import {Operation} from "../../executions/chocolatey/index.js";
import {Informer, Status} from "../../models.js";
import chalk from "chalk";

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
            case Operation.DependencyInstallNotElevated:
                this._inform('warning', chalk.yellow('Chocolatey cannot be installed without elevated privileges. Please run the command again with elevated privileges.'));
                break;
            case Operation.DependencyInstallStarted:
                this._inform_partial(`chocolatey is being installed... `, log);
                break;
            case Operation.DependencyInstallFinished:
                this._inform_partial(log.status === Status.Success ? 'done' : 'failed', log);
                break;
            case Operation.DependencyInstallSkipped:
                this._inform('warning', chalk.yellow('Chocolatey installation was skipped.'));
                break;
            case Operation.DependencyCheck:
                this._inform('error', `Chocolatey not installed. Please install chocolatey and retry command.`);
                break;
        }
    }
}