import docker_compose from "../../common/executor/executions/docker-compose/index.js";
import docker_container from "../../common/executor/executions/docker-container/index.js";
import powershell_script from "../../common/executor/executions/powershell-script/index.js";
import powershell_command from "../../common/executor/executions/powershell-command/index.js";
import mssql from "../../common/executor/executions/mssql/index.js";
import chocolatey from "./executions/chocolatey/index.js";

import {Execute} from "../../execution/executor/action-mapper.js";
import {ExecutionLog, Status} from "./models.js";

export default new class {
    /**
     * Get executor
     * @param type {string}
     * @return {ExecutionInterface}
     */
    get(type) {
        switch (type) {
            case "docker-compose":
                return docker_compose
            case "docker-container":
                return docker_container;
            case "powershell-script":
                return powershell_script;
            case "powershell-command":
                return powershell_command;
            case "mssql":
                return mssql
            case "chocolatey":
                return chocolatey;
            default:
                throw new Error(`'${type}' type is not supported`);
        }
    }

    /**
     * Check if all necessary dependencies are available
     * @param executes {Execute[]}
     * @return {Promise<ExecutionLog>}
     */
    async dependencyCheck(executes) {
        let result;

        for (const execute of executes) {
            if (result?.status === Status.Error) {
                return result;
            }

            switch (execute.type) {
                case "docker-compose":
                    result = docker_compose.check();
                    break;
                case "docker-container":
                    result = docker_container.check();
                    break;
                case "powershell-script":
                    result = powershell_script.check();
                    break;
                case "powershell-command":
                    result = powershell_command.check();
                    break;
                case "mssql":
                    result = mssql.check();
                    break;
                case "chocolatey":
                    result = chocolatey.check();
                    break;
                default:
                    throw new Error(`'${execute.type}' type is not supported`);
            }
        }

        return new ExecutionLog(Status.Success, "dependency-check", "dependency-check");
    }
}
