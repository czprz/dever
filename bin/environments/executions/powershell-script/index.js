import powershell from '../../../common/helper/powershell.js';
import customOptions from '../../../common/helper/custom_options.js';
import logger from '../../../common/helper/logger.js';

import {Project} from "../../../common/models/internal.js";

import path from 'path';
import chalk from "chalk";

"use strict";
export default new class {
    /**
     *
     * @param project {Project}
     * @param execution {Execution}
     * @param runtime {Runtime}
     * @return {Promise<void>}
     */
    async handle(project, execution, runtime) {
        if (runtime.stop && !execution.hasStop) {
            if (execution.hasStart) {
                console.log(chalk.yellow(`powershell-script: '${execution.name}' does not have a stop action.`));
            }

            return;
        }

        try {
            const file = path.join(project.location, execution.file);
            const fileWithParameters = customOptions.addOptionsToFile(file, execution.options, runtime.args);
            await powershell.executeFileSync(fileWithParameters, execution.runAsElevated);

            console.log(`powershell-script: '${execution.name}' completed successfully`);
        } catch (e) {
            logger.error(`powershell-script: '${execution.name}' completed with errors`, e);
        }
    }
}
