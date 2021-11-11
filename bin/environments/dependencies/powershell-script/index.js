module.exports = {
    handle: handle
};

const powershell = require('../../../common/helper/powershell');
const path = require("path");

/**
 *
 * @param component {Config}
 * @param dependency {Dependency}
 * @param args {Args}
 * @param name {string}
 */
function handle(component, dependency, args, name) {
    switch(true) {
        case args.start: {
            const file = path.join(component.location, dependency.file);
            powershell.executeFileSync(file);

            console.log(`powershell-script: '${name}' completed successfully`);

            break;
        }
        case args.stop:
            // Todo: Any reason for having this? / How can this be implemented?
        break;
    }
}
