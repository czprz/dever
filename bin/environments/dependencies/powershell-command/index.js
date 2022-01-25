module.exports = {
    handle: handle
}

const powershell = require('../../../common/helper/powershell');
const customOptions = require('../../../common/helper/custom_options');

/**
 *
 * @param dependency {Dependency}
 * @param args {EnvArgs}
 * @param name {string}
 */
async function handle(dependency, args, name) {
    switch(true) {
        case args.start: {
            try {
                const command = customOptions.addOptionsToCommand(dependency.command, dependency.options, args);
                await powershell.executeSync(command, dependency.runAsElevated);

                console.log(`powershell-command: '${name}' completed successfully`);
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
