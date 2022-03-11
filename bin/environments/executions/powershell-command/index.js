module.exports = {
    handle: handle
}

const powershell = require('../../../common/helper/powershell');
const customOptions = require('../../../common/helper/custom_options');

/**
 *
 * @param execution {Execution}
 * @param args {EnvArgs}
 */
async function handle(execution, args) {
    switch(true) {
        case args.start: {
            try {
                const command = customOptions.addOptionsToCommand(execution.command, execution.options, args);
                await powershell.executeSync(command, execution.runAsElevated);

                console.log(`powershell-command: '${execution.name}' completed successfully`);
            } catch (e) {
                console.error(e);
            }

            break;
        }
        case args.stop:
            // Todo: Any reason for having this? / How can this be implemented?
        break;
    }
}
