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
 * @param runtime {Runtime}
 * @return {Promise<void>}
 */
async function handle(component, execution, runtime) {
    switch(true) {
        case runtime.start: {
            const file = path.join(component.location, execution.file);
            const fileWithParameters = customOptions.addOptionsToFile(file, execution.options, runtime.args);
            await powershell.executeFileSync(fileWithParameters, execution.runAsElevated);

            console.log(`powershell-script: '${execution.name}' completed successfully`);

            break;
        }
        case runtime.stop:
            // Todo: Any reason for having this? / How can this be implemented?
        break;
    }
}
