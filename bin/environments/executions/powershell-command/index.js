module.exports = {
    handle: handle
}

const powershell = require('../../../common/helper/powershell');
const customOptions = require('../../../common/helper/custom_options');

/**
 *
 * @param execution {Execution}
 * @param runtime {Runtime}
 */
async function handle(execution, runtime) {
    switch(true) {
        case runtime.start: {
            try {
                const command = customOptions.addOptionsToCommand(execution.command, execution.options, runtime.args);
                await powershell.executeSync(command, execution.runAsElevated);

                console.log(`powershell-command: '${execution.name}' completed successfully`);
            } catch (e) {
                console.error(e);
            }

            break;
        }
        case runtime.stop:
            // Todo: Any reason for having this? / How can this be implemented?
        break;
    }
}
