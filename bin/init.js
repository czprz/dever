const powershell = require('./common/helper/powershell');
const projectsConfig = require('./configuration/projects-config');
const versionChecker = require('./common/helper/version-checker');
const configValidator = require('./common/helper/config-validator');

const chalk = require("chalk");
const path = require("path");
const fs = require("fs");

module.exports = new class {
    async init() {
        const file = path.join(path.dirname(fs.realpathSync(__filename)), 'common/find_all_dever_json_files.ps1');

        console.log('Initialization has started.. Please wait..');

        projectsConfig.clear();

        const raw = await powershell.executeFileSync(file);
        const paths = raw.trim().split('\n');

        for (const path of paths) {
            this.#getConfigFiles(path);
        }

        const configs = projectsConfig.getAll();

        this.#checkForSupportedVersion(configs);
        this.#checkForKeywordViolations(configs);

        console.log('Initialization has been completed!');
    }

    /**
     * Check if there is any dever.json which has an unsupported version
     * @param configs {Config[]}
     */
    #checkForSupportedVersion(configs) {
        if (!versionChecker.supported(configs)) {
            console.warn(chalk.yellow(`One or more of the found projects is not supported due to dever.json version not being supported by the installed version of dever`));
            console.warn(chalk.yellow(`Check 'dever list --not-supported' to get a list of the unsupported projects`));
        }
    }

    #getConfigFiles(filePath) {
        const file = filePath.trim();

        if (!file) {
            return;
        }

        if ('dever.json' !== path.basename(file)) {
            return;
        }

        projectsConfig.add(file);
    }

    /**
     * Check if any projects has keywords which violate pre-defined keys ('init', 'list', 'config', 'validate')
     * @param configs {Config[]}
     */
    #checkForKeywordViolations(configs) {
        for (const config of configs) {
            if (configValidator.validate(config)) {
                continue;
            }

            console.error(chalk.red(`Could not add the project '${config.name}' due to having keywords which are conflicting with pre-defined keys`));

            projectsConfig.remove(config.location);
        }
    }
}
