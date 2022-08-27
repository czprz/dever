import docker_compose from "../../common/executor/executions/docker-compose/index.js";
import docker_container from "../../common/executor/executions/docker-container/index.js";
import powershell_script from "../../common/executor/executions/powershell-script/index.js";
import powershell_command from "../../common/executor/executions/powershell-command/index.js";
import mssql from "../../common/executor/executions/mssql/index.js";
import chocolatey from "./executions/chocolatey/index.js";

import {Runtime} from "../../execution/executor/runtime-mapper.js";
import {Execute} from "../../execution/executor/action-mapper.js";
import {Result, Status} from "./models.js";

export default new class {
    /**
     * Handles handlers for each environment dependency
     * @param execute {Execute}
     * @param runtime {Runtime}
     * @returns {Promise<Result>}
     */
    async execute(execute, runtime) {
        switch (execute.type) {
            case "docker-compose":
                return docker_compose.handle(execute, runtime);
            case "docker-container":
                return docker_container.handle(execute, runtime);
            case "powershell-script":
                return powershell_script.handle(execute, runtime);
            case "powershell-command":
                return powershell_command.handle(execute, runtime);
            case "mssql":
                return mssql.handle(execute, runtime);
            case "chocolatey":
                return chocolatey.handle(execute, runtime);
            default:
                throw new Error(`'${execute.type}' type is not supported`);
        }
    }

    /**
     * Check if all necessary dependencies are available
     * @param executes {Execute[]}
     * @return {Promise<Result>}
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

        return new Result(Status.Success, "dependency-check", "dependency-check");
    }
}
