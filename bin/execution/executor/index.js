import logger from "../../common/helper/logger.js";
import executorHandler from "../../common/executor/index.js";
import {Runtime} from "./runtime-mapper.js";

import actionMapper, {Execute, Executable} from "./action-mapper.js";
import validator from "./validator.js";
import elevatedConfirmer from "./elevated-confirmer.js";
import dependencyChecker from "./dependency-checker.js";

import chalk from "chalk";
import {Subject, takeUntil} from "rxjs";
import responder from "../../common/executor/responder/index.js";
import runOnceChecker from "./run-once-checker.js";

export default new class {
    /**
     * Executes actions
     * @param segment {Segment}
     * @param project {Project}
     * @param runtime {Runtime}
     * @returns {Promise<void>}
     */
    async run(segment, project, runtime) {
        if (runtime.up && runtime.down) {
            console.error(chalk.redBright('You cannot defined both --up and --down in the same command'));
            return;
        }

        switch (true) {
            case runtime.up:
            case runtime.down: {
                if (await this.PropertyConditionsNotMet(segment, runtime)) {
                    return;
                }

                const executables = actionMapper.map(segment.actions, project.location, runtime);

                logger.create();

                const result = validator.validate(executables, runtime);
                if (!result.status) {
                    console.error(result.message);
                    return;
                }

                if (!await dependencyChecker.check(executables)) {
                    return;
                }

                if (!await elevatedConfirmer.confirm(runtime.args.skip, executables)) {
                    return;
                }

                for (const executable of executables) {
                    if (runOnceChecker.shouldSkip(executable, runtime)) {
                        continue;
                    }

                    await this.#hasWait(executable, 'before');
                    await this.#executeStep(executable.before, runtime);

                    const subscribeUntil = new Subject();

                    const executor = executorHandler.get(executable.type);

                    const executionLog$ = executor.getLogger();
                    executionLog$.pipe(takeUntil(subscribeUntil)).subscribe(log => {
                        runOnceChecker.update(project, executable, log);
                        responder.respond(log, executable);
                    });

                    await executor.handle(executable, runtime);

                    subscribeUntil.next(null);
                    subscribeUntil.complete();

                    await this.#executeStep(executable.after, runtime);
                    await this.#hasWait(executable, 'after');
                }

                logger.destroy();

                if (logger.hasLogs.error()) {
                    console.log(chalk.yellow(`One or more actions ended with errors. Please check the log for more detail. ${logger.getLogFile()}`));
                }

                break;
            }
        }
    }

    /**
     * Checks if property conditions is met
     * @param segment {Segment}
     * @param runtime {Runtime}
     * @return {Promise<boolean>}
     */
    async PropertyConditionsNotMet(segment, runtime) {
        if (await elevatedConfirmer.warn(runtime.args.skip, segment.properties.elevated)) {
            console.error(chalk.redBright('You cannot run this command without elevated permissions'));
            return true;
        }

        if (segment.properties.name_required && runtime.args.name == null) {
            console.error(chalk.redBright('You cannot run this command without name argument being defined'));
            return true;
        }

         return false;
    }

    /**
     * Creates promise which delays an await for defined period of time
     * @param executable {Executable}
     * @param timing {'after'|'before'}
     * @returns {Promise<unknown>}
     */
    async #hasWait(executable, timing) {
        if (executable.wait == null) {
            return null;
        }

        if (executable.wait.when === timing) {
            logger.info(chalk.yellowBright(`Waiting for ${executable.wait.seconds} milliseconds before next action`));
            return new Promise(resolve => setTimeout(resolve, executable.wait.seconds));
        }
    }

    /**
     * Executes before or after steps
     * @param execute {Execute}
     * @param runtime {Runtime}
     * @return {Promise<void>}
     */
    async #executeStep(execute, runtime) {
        if (execute == null) {
            return;
        }

        const executor = executorHandler.get(execute.type);
        await executor.handle(execute, runtime);
    }
}