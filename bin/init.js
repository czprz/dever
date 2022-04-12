const powershell = require('./common/helper/powershell');
const projectsConfig = require('./configuration/projects-config');
const versionChecker = require('./common/helper/version-checker');
const configValidator = require('./common/helper/config-validator');

const readline = require("readline");
const chalk = require("chalk");
const path = require("path");
const fs = require("fs");

module.exports = new class {
    async init() {
        if (!projectsConfig.any()) {
            await this.#findProjects();
            return;
        }

        const rl = readline.createInterface(process.stdin, process.stdout);
        await rl.question('Are you sure you want to start the search for dever supported projects? [yes]/no:', async (answer) => {
            const lcAnswer = answer.toLowerCase();
            if (lcAnswer === 'y' || lcAnswer === 'yes') {
                await this.#findProjects();
            }

            rl.close();
        });
    }

    /**
     *
     * @returns {Promise<void>}
     */
    async #findProjects() {
        console.log('Initialization has started.. Please wait..');

        const file = path.join(path.dirname(fs.realpathSync(__filename)), 'common/find_all_dever_json_files.ps1');

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
            console.warn(chalk.yellow(`One or more of the found projects is not supported due to the dever.json version`));
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

            projectsConfig.remove(path.join(config.location, 'dever.json'));
        }
    }
}
