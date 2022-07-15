import docker_compose from "../../common/executor/executions/docker-compose/index.js";
import docker_container from "../../common/executor/executions/docker-container/index.js";
import powershell_script from "../../common/executor/executions/powershell-script/index.js";
import powershell_command from "../../common/executor/executions/powershell-command/index.js";
import mssql from "../../common/executor/executions/mssql/index.js";

import {Executable, Runtime} from "../models/dever-json/internal.js";
import {ExecutionResult} from "./models.js";

export default new class {
    /**
     * Handles handlers for each environment dependency
     * @param executable {Executable}
     * @param runtime {Runtime}
     * @returns {Promise<ExecutionResult>}
     */
    async execute(executable, runtime) {
        switch (executable.type) {
            case "docker-compose":
                return docker_compose.handle(executable, runtime);
            case "docker-container":
                return docker_container.handle(executable, runtime);
            case "powershell-script":
                return await powershell_script.handle(executable, runtime);
            case "powershell-command":
                return await powershell_command.handle(executable, runtime);
            case "mssql":
                return await mssql.handle(executable, runtime);
            // case "chocolatey":
            //     await chocolatey.handle(execution, runtime);
            //     break;
            default:
                throw new Error(`'${executable.type}' type is not supported`);
        }
    }
}