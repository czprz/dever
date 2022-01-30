const powershell = require('./common/helper/powershell');
const componentHandler = require('./configuration/handleComponents');
const versionChecker = require('./common/helper/version-checker');

const path = require("path");
const fs = require("fs");

module.exports = new class {
    async init() {
        const file = path.join(path.dirname(fs.realpathSync(__filename)), 'common/find_all_dever_json_files.ps1');

        console.log('Initialization has started.. Please wait..');

        componentHandler.clearComponents();

        const raw = await powershell.executeFileSync(file);
        const paths = raw.trim().split('\n');

        for (const path of paths) {
            this.#getConfigFiles(path);
        }

        const allConfigs = componentHandler.getAllComponents();
        if (!versionChecker.supported(allConfigs)) {
            console.warn(`One or more of the found projects is not supported due to dever.json version not being supported by the installed version of dever`);
            console.warn(`Check 'dever list --not-supported' to get a list of the unsupported projects`);
        }

        console.log('Initialization has been completed!');
    }

    #getConfigFiles(filePath) {
        const file = filePath.trim();

        if (!file) {
            return;
        }

        if ('dever.json' !== path.basename(file)) {
            return;
        }

        componentHandler.addComponent(file);
    }
}
