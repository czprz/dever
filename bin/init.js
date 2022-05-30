import powershell from './common/helper/powershell.js';
import projectsConfig from './configuration/projects-config.js';
import versionChecker from './common/helper/version-checker.js';
import configValidator from './common/helper/config-validator.js';

import { fileURLToPath } from 'url';
import readline from 'readline';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs';

"use strict";
export default new class {
    /**
     * Initializes dever configuration file if not existing and finds all available dever.json supported projects
     * @return {Promise<void>}
     */
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
     * Finds all available dever.json supported projects
     * @returns {Promise<void>}
     */
    async #findProjects() {
        console.log('Initialization has started.. Please wait..');

        const __filename = fileURLToPath(import.meta.url);
        const file = path.join(path.dirname(fs.realpathSync(__filename)), 'common/find_all_dever_json_files.ps1');

        projectsConfig.clear();

        const raw = await powershell.executeFileSync(file);
        if (raw == null || raw?.length === 0) {
            console.error(chalk.yellow('Could not find any dever supported projects'));
            return;
        }

        const paths = raw.trim().split('\n');

        for (const path of paths) {
            this.#verifyAndSavePathToDeverJson(path);
        }

        const configs = projectsConfig.getAll();

        this.#checkForSupportedVersion(configs);
        this.#checkForKeywordViolations(configs);

        console.log('Initialization has been completed!');
    }

    /**
     * Adds location of dever.json to dever internal configuration file
     * @param filePath {string}
     * @return void
     */
    #verifyAndSavePathToDeverJson(filePath) {
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
     * Check if there is any dever.json which has an unsupported version
     * @param projects {Project[]}
     * @return void
     */
    #checkForSupportedVersion(projects) {
        if (!versionChecker.supported(projects)) {
            console.warn(chalk.yellow(`One or more of the found projects is not supported due to the dever.json version`));
            console.warn(chalk.yellow(`Check 'dever list --not-supported' to get a list of the unsupported projects`));
        }
    }

    /**
     * Check if any projects has keywords which violate pre-defined keys ('init', 'list', 'config', 'validate')
     * @param projects {Project[]}
     * @return void
     */
    #checkForKeywordViolations(projects) {
        for (const project of projects) {
            if (configValidator.validate(project)) {
                continue;
            }

            console.error(chalk.red(`Could not add the project '${project.name}' due to having keywords which are conflicting with pre-defined keys`));

            projectsConfig.remove(path.join(project.location, 'dever.json'));
        }
    }
}
