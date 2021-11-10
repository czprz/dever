module.exports = {
    handle: handle
}

const powershell = require('../../../common/helper/powershell');

/**
 *
 * @param dependency {Dependency}
 * @param name {string}
 */
function handle(dependency, name) {
    try {
        powershell.executeSync(dependency.command);

        console.log(`powershell-command: '${name}' completed successfully`);
    } catch (e) {
        console.error(e);
    }
}
