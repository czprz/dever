import powershell from '../../../common/helper/powershell.js';
import customOptions from '../../../common/helper/custom_options.js';
import logger from '../../../common/helper/logger.js';

"use strict";
export default new class {
    /**
     *
     * @param execution {Execution}
     * @param runtime {Runtime}
     */
    async handle(execution, runtime) {
        try {
            const command = customOptions.addOptionsToCommand(execution.command, execution.options, runtime.args);
            await powershell.executeSync(command, execution.runAsElevated);

            console.log(`powershell-command: '${execution.name}' completed successfully`);
        } catch (e) {
            logger.error(`powershell-command: '${execution.name}' completed with errors`, e);
        }
    }
}