import logger from "../../common/helper/logger.js";
import executor from "../../common/executor/index.js";
import responder from "../../common/executor/responder/index.js";
import {Status} from "../../common/executor/models.js";
import {Runtime} from "./runtime-mapper.js";

import actionMapper, {Execute, Executable} from "./action-mapper.js";
import validator from "./validator.js";
import elevatedConfirmer from "./elevated-confirmer.js";

import chalk from "chalk";

export default new class {
    /**
     * Executes actions
     * @param segment {Segment}
     * @param location {Location}
     * @param runtime {Runtime}
     * @returns {Promise<void>}
     */
    async run(segment, location, runtime) {
        if (runtime.up && runtime.down) {
            console.error(chalk.redBright('You cannot defined both --up and --down in the same command'));
            return;
        }

        switch (true) {
            case runtime.up:
            case runtime.down: {
                if (await elevatedConfirmer.warn(runtime.args.skip, segment.properties.elevated)) {
                    console.error(chalk.redBright('You cannot run this command without elevated permissions'));
                    return;
                }

                if (segment.properties.name_required && runtime.args.name == null) {
                    console.error(chalk.redBright('Your cannot run this command without name argument being defined'));
                    return;
                }

                const executables = actionMapper.map(segment.actions, location, runtime);

                logger.create();

                const result = validator.validate(executables, runtime);
                if (!result.status) {
                    console.error(result.message);
                    return;
                }

                const checkResult = await executor.dependencyCheck(executables);
                if (checkResult.status === Status.Error) {
                    responder.respond(checkResult, null);
                    return;
                }

                if (!await elevatedConfirmer.confirm(runtime.args.skip, executables)) {
                    return;
                }

                for (const executable of executables) {
                    await this.#hasWait(executable, 'before');
                    await this.#executeStep(executable.before, runtime);

                    const result = await executor.execute(executable, runtime);
                    responder.respond(result, executable);

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
            return new Promise(resolve => setTimeout(resolve, executable.wait.seconds));
        }
    }

    /**
     * Executes before or after steps
     * @param executable {Execute}
     * @param runtime {Runtime}
     * @return {Promise<void>}
     */
    async #executeStep(executable, runtime) {
        if (executable == null) {
            return;
        }

        await executor.execute(executable, runtime);
    }
}