import executorHandler from "../../common/executor/index.js";
import {Status} from "../../common/executor/models.js";
import responder from "../../common/executor/responder/index.js";
import {Subject, takeUntil} from "rxjs";

export default new class {
    /**
     * Check if execution can run or not
     * @param executables {Executable[]}
     * @return {Promise<boolean>}
     */
    async check(executables) {
        for (const executable of executables) {
            const executor = await executorHandler.get(executable.type);

            const executionLog = executor.check();
            if (executionLog.status !== Status.Error) {
                continue;
            }

            if (this.hasInstaller(executionLog)) {
                const subscribeUntil = new Subject();

                const executionLog$ = executor.getLogger();
                executionLog$.pipe(takeUntil(subscribeUntil)).subscribe(x => responder.respond(x, null));

                const result = await executor.install();

                subscribeUntil.next(null);
                subscribeUntil.complete();

                if (result.status === Status.Success) {
                    continue;
                }

                responder.respond(executionLog, null);
                return false;
            }

            responder.respond(executionLog, null);
            return false;
        }

        return true;
    }

    /**
     * Check if execution has installer
     * @param log {ExecutionLog}
     */
    hasInstaller(log) {
        switch (log.type) {
            case "chocolatey":
                return true;
            default:
                return false;
        }
    }
}