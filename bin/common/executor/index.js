import docker_compose from "../../common/executor/executions/docker-compose/index.js";
import docker_container from "../../common/executor/executions/docker-container/index.js";
import powershell_script from "../../common/executor/executions/powershell-script/index.js";
import powershell_command from "../../common/executor/executions/powershell-command/index.js";
import mssql from "../../common/executor/executions/mssql/index.js";

import {Execute, Runtime} from "../models/dever-json/internal.js";
import {CheckResult, ExecutionResult, Status} from "./models.js";

export default new class {
    /**
     * Handles handlers for each environment dependency
     * @param execute {Execute}
     * @param runtime {Runtime}
     * @returns {Promise<ExecutionResult>}
     */
    async execute(execute, runtime) {
        switch (execute.type) {
            case "docker-compose":
                return docker_compose.handle(execute, runtime);
            case "docker-container":
                return docker_container.handle(execute, runtime);
            case "powershell-script":
                return await powershell_script.handle(execute, runtime);
            case "powershell-command":
                return await powershell_command.handle(execute, runtime);
            case "mssql":
                return await mssql.handle(execute, runtime);
            // case "chocolatey":
            //     await chocolatey.handle(execution, runtime);
            //     break;
            default:
                throw new Error(`'${execute.type}' type is not supported`);
        }
    }

    /**
     * Check if all necessary dependencies are available
     * @param executes {Execute[]}
     * @return {Promise<CheckResult>}
     */
    async dependencyCheck(executes) {
        let result;

        for (const execute of executes) {
            switch (execute.type) {
                case "docker-compose":
                    result = docker_compose.check();
                    if (result.status === Status.Error) {
                        return result;
                    }
                    break;
                case "docker-container":
                    result = docker_container.check();
                    if (result.status === Status.Error) {
                        return result;
                    }
                    break;
                case "powershell-script":
                    result = powershell_script.check();
                    if (result.status === Status.Error) {
                        return result;
                    }
                    break;
                case "powershell-command":
                    result = powershell_command.check();
                    if (result.status === Status.Error) {
                        return result;
                    }
                    break;
                case "mssql":
                    result = mssql.check();
                    if (result.status === Status.Error) {
                        return result;
                    }
                    break;
                // case "chocolatey":
                //     if (!chocolatey.check()) {
                //         return false;
                //     }
                //     break;
                default:
                    throw new Error(`'${execute.type}' type is not supported`);
            }
        }

        return new CheckResult(Status.Success, "All dependencies are available");
    }
}
