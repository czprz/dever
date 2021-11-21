module.exports = {
    handle: handle
};

const powershell = require('../../../common/helper/powershell');
const customOptions = require('../../../common/helper/custom_options');
const path = require("path");

/**
 *
 * @param component {Config}
 * @param dependency {Dependency}
 * @param args {Args}
 * @param name {string}
 * @return {Promise<void>}
 */
async function handle(component, dependency, args, name) {
    switch(true) {
        case args.start: {
            const file = path.join(component.location, dependency.file);
            const fileWithParameters = customOptions.addOptionsToFile(file, dependency.options, args);
            await powershell.executeFileSync(fileWithParameters, dependency.runAsElevated);

            console.log(`powershell-script: '${name}' completed successfully`);

            break;
        }
        case args.stop:
            // Todo: Any reason for having this? / How can this be implemented?
        break;
    }
}
