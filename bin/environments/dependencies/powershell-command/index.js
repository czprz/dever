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
function handle(dependency, args, name) {
    switch(true) {
        case args.start: {
            try {
                powershell.executeSync(dependency.command);

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
