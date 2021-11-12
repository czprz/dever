module.exports = {
    handle: handle
}

const powershell = require('../../../common/helper/powershell');

/**
 *
 * @param dependency {Dependency}
 * @param args {Args}
 * @param name {string}
 */
async function handle(dependency, args, name) {
    switch(true) {
        case args.start: {
            try {
                await powershell.executeSync(dependency.command, dependency.runAsElevated);

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
