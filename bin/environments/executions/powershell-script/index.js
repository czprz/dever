import powershell from '../../../common/helper/powershell.js';
import customOptions from '../../../common/helper/custom_options.js';
import logger from '../../../common/helper/logger.js';

import path from 'path';

"use strict";
export default new class {
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