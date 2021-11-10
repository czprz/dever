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
    const file = path.join(component.location, dependency.file);
    powershell.executeFileSync(file);

    console.log(`powershell-script: '${name}' completed successfully`);
}
