const powershell = require('../../../common/helper/powershell');
const customOptions = require('../../../common/helper/custom_options');
const logger = require('../../../common/helper/logger');

"use strict";
module.exports = new class {
    /**
     *
     * @param execution {Execution}
     * @param runtime {Runtime}
     */
    async handle(execution, runtime) {
        switch (true) {
            case runtime.start: {
                try {
                    const command = customOptions.addOptionsToCommand(execution.command, execution.options, runtime.args);
                    await powershell.executeSync(command, execution.runAsElevated);

                    console.log(`powershell-command: '${execution.name}' completed successfully`);
                } catch (e) {
                    logger.error(`powershell-command: '${execution.name}' completed with errors`, e);
                }

                break;
            }
            case runtime.stop:
                // Todo: Add support for having starting and stopping supported scripts / commands
                // Todo: Stopping scripts and commands should be optional
                break;
        }
    }
}