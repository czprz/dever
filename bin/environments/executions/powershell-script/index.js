module.exports = {
    handle: handle
};

const powershell = require('../../../common/helper/powershell');
const customOptions = require('../../../common/helper/custom_options');
const path = require("path");

/**
 *
 * @param component {Config}
 * @param execution {Execution}
 * @param args {EnvArgs}
 * @return {Promise<void>}
 */
async function handle(component, execution, args) {
    switch(true) {
        case args.start: {
            const file = path.join(component.location, execution.file);
            const fileWithParameters = customOptions.addOptionsToFile(file, execution.options, args);
            await powershell.executeFileSync(fileWithParameters, execution.runAsElevated);

            console.log(`powershell-script: '${execution.name}' completed successfully`);

            break;
        }
        case args.stop:
            // Todo: Any reason for having this? / How can this be implemented?
        break;
    }
}
