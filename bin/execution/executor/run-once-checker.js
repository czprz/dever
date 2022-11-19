import hasher from "../../common/helper/hasher.js";
import projectConfigFacade from "../../configuration/facades/project-config-facade.js";

import {Runtime} from "./runtime-mapper.js";
import {Status} from "../../common/executor/models.js";
import {HasRunAction} from "../../common/models/dot-dever/external.js";

export default new class {
    /**
     * Should skip if already run
     * @param executable {Executable}
     * @param runtime {Runtime}
     * @return {boolean}
     */
    shouldSkip(executable, runtime) {
        return executable.runOnce && this.#hasRun(executable, runtime);
    }

    /**
     * Update executable with new hash
     * @param project {Project}
     * @param executable {Executable}
     * @param log {ExecutionLog}
     */
    update(project, executable, log) {
        if (log.status !== Status.Success) {
            return;
        }

        projectConfigFacade.update(project.id, (local) => {
            local.hasRunActions = local.hasRunActions.filter(x => x.name === executable.name);

            const json = this.#encode(executable);
            local.hasRunActions.push(new HasRunAction(executable.name, true, hasher.hash(json)));
        });
    }

    /**
     * Skips if lashHash is the same
     * @param executable {Executable}
     * @param runtime {Runtime}
     * @return {boolean}
     */
    #hasRun(executable, runtime) {
        if (executable.lastHash === null) {
            return false;
        }

        if (runtime.include.executions.length > 0 && runtime.include.executions.some(x => x.toLowerCase() === executable.name.toLowerCase())) {
            return false;
        }

        const json = this.#encode(executable);
        return executable.lastHash !== hasher.hash(json);
    }

    /**
     * Get hash of executable
     * @param executable {Executable}
     * @return {string}
     */
    #encode(executable) {
        return JSON.stringify(executable);
    }
}