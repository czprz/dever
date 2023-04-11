import chalk from "chalk";
import readline from "readline";
import path from "path";
import os from "os";

import projectConfigFacade from "../configuration/facades/project-config-facade.js";

import winScan from './windows.js';
import linScan from './linux.js';

"use strict";
export default new class {
    /**
     * Scan for dever configuration files
     * @return {Promise<void>}
     */
    async scan() {
        if (!projectConfigFacade.any()) {
            await this.#findProjects();
            return;
        }

        const rl = readline.createInterface(process.stdin, process.stdout);
        await rl.question('Are you sure you want to start the scanning for dever supported projects? [yes]/no:', async (answer) => {
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
        console.log('Scanning has started.. Please wait..');

        let paths = [];

        if (os.platform() === 'win32') {
            paths = await winScan.scan();
        } else if (os.platform() === 'linux') {
            paths = await linScan.scan();
        } else {
            throw new Error('Unsupported operating system: ' + os.platform());
        }

        if (paths?.length === 0) {
            console.error(chalk.yellow('Could not find any dever supported projects'));
            return;
        }

        const projects = projectConfigFacade.getAll();
        this.#removeProjects(projects, paths);
        this.#addProjects(projects, paths);

        console.log('Scanning has been completed!');

        this.#informOfUnsupportedProjects();
    }

    /**
     * Removes projects that are not found anymore
     * @param projects {Project[]}
     * @param paths {string[]}
     */
    #removeProjects(projects, paths) {
        const notFoundProjects = projects.filter(x => !paths.some(y => y === x.location.full));
        for (const notFoundProject of notFoundProjects) {
            projectConfigFacade.remove(notFoundProject.id);
        }
    }

    /**
     * Add project to .dever configuration file
     * @param projects {Project[]}
     * @param paths {string[]}
     */
    #addProjects(projects, paths) {
        const newProjects = paths.filter(x => !projects.some(y => y.location.full === x));
        for (const newProject of newProjects) {
            const file = newProject.trim();

            if (!file) {
                return;
            }

            if ('dever.json' !== path.basename(file)) {
                return;
            }

            projectConfigFacade.add(file);
        }
    }

    /**
     * Check if there is any dever.json which has an unsupported version
     */
    #informOfUnsupportedProjects() {
        const projects = projectConfigFacade.getAll();
        if (projects.some(x => !x.supported || !x.validKeywords || !x.validSchema)) {
            console.warn(chalk.yellow('One or more of the found projects are not supported'));
            console.warn(chalk.yellow(`Check 'dever list --not-supported' to get a list of the unsupported projects`));
        }
    }
}