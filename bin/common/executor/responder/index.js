import DockerContainerInformer from './docker-container/index.js';
import DockerComposeInformer from './docker-compose/index.js';
import PowershellScriptInformer from './powershell-script/index.js';
import MSSQLInformer from './mssql/index.js';
import ChocolateyInformer from './chocolatey/index.js';
import PowerShellCommandInformer from './powershell-command/index.js';

import {Executable} from "../../../execution/executor/action-mapper.js";
import {ExecutionLog} from "../models.js";

export default new class {
    /**
     * Handles error messages
     * @param log {ExecutionLog}
     * @param executable {Executable}
     */
    respond(log, executable) {
        switch (log.type) {
            case "docker-compose":
                DockerComposeInformer.inform(log, executable?.name);
                break;
            case "docker-container":
                DockerContainerInformer.inform(log, executable?.name);
                break;
            case "powershell-script":
                PowershellScriptInformer.inform(log, executable?.name);
                break;
            case "powershell-command":
                PowerShellCommandInformer.inform(log, executable?.name);
                break;
            case "mssql":
                MSSQLInformer.inform(log, executable?.name);
                break;
            case "chocolatey":
                ChocolateyInformer.inform(log, executable?.name);
                break;
            default:
                break;
        }
    }
}