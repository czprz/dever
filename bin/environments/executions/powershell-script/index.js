const powershell = require('../../../common/helper/powershell');
const customOptions = require('../../../common/helper/custom_options');
const logger = require('../../../common/helper/logger');

const path = require("path");

module.exports = new class {
    /**
     *
     * @param component {Config}
     * @param execution {Execution}
     * @param runtime {Runtime}
     * @return {Promise<void>}
     */
    async handle(component, execution, runtime) {
        switch(true) {
            case runtime.start: {
                try {
                    const file = path.join(component.location, execution.file);
                    const fileWithParameters = customOptions.addOptionsToFile(file, execution.options, runtime.args);
                    await powershell.executeFileSync(fileWithParameters, execution.runAsElevated);

                    console.log(`powershell-script: '${execution.name}' completed successfully`);
                } catch (e) {
                    logger.error(`powershell-script: '${execution.name}' completed with errors`, e);
                }

                break;
            }
            case runtime.stop:
                // Todo: Any reason for having this? / How can this be implemented?
                break;
        }
    }
}
