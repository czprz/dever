import powershell from './common/helper/powershell.js';
import projectConfigFacade from "./configuration/facades/project-config-facade.js";
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
        if (!projectConfigFacade.any()) {
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

        projectConfigFacade.clear();

        const raw = await powershell.executeFileSync(file);
        if (raw == null || raw?.length === 0) {
            console.error(chalk.yellow('Could not find any dever supported projects'));
            return;
        }

        const paths = raw.trim().split('\n');

        for (const path of paths) {
            this.#verifyAndSavePathToDeverJson(path);
        }

        const configs = projectConfigFacade.getAll();

        this.#informOfUnsupportedProjects(configs);

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

        projectConfigFacade.add(file);
    }

    /**
     * Check if there is any dever.json which has an unsupported version
     * @param projects {Project[]}
     * @return void
     */
    #informOfUnsupportedProjects(projects) {
        if (!versionChecker.supported(projects) || projects.some(x => configValidator.validate(x))) {
            console.warn(chalk.yellow('One or more of the found projects are not supported'));
            console.warn(chalk.yellow(`Check 'dever list --not-supported' to get a list of the unsupported projects`));
        }
    }
}
