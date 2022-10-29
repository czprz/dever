import docker_compose from "../../common/executor/executions/docker-compose/index.js";
import docker_container from "../../common/executor/executions/docker-container/index.js";
import powershell_script from "../../common/executor/executions/powershell-script/index.js";
import powershell_command from "../../common/executor/executions/powershell-command/index.js";
import mssql from "../../common/executor/executions/mssql/index.js";
import chocolatey from "./executions/chocolatey/index.js";

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
}
