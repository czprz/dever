import chalk from "chalk";
import readline from "readline";
import path from "path";
import fs from "fs";
import {execSync} from "child_process";

import projectConfigFacade from "./configuration/facades/project-config-facade.js";

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

        const paths = [];
        const disks = this.#getDisks();

        for (const disk of disks) {
            const files = this.#findFilesByName(disk, 'dever.json');
            paths.push(...files);
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

    /**
     * Check if the folder should be skipped
     * @param folderName {string}
     * @returns {boolean}
     */
    #isSkipFolder(folderName) {
        return ['Windows', 'Program Files', 'Program Files (x86)', 'ProgramData', 'AppData', 'node_modules'].includes(folderName);
    }

    /**
     * Find all files with the given name
     * @param rootPath {string}
     * @param filename {string}
     * @param files {string[]}
     * @returns {string[]}
     */
    #findFilesByName(rootPath, filename, files = []) {
        try {
            if (fs.existsSync(rootPath)) {
                const contents = fs.readdirSync(rootPath);

                for (const file of contents) {
                    const filePath = path.join(rootPath, file);

                    try {
                        const fileStat = fs.statSync(filePath);

                        if (fileStat.isDirectory()) {
                            if (!this.#isSkipFolder(file)) {
                                this.#findFilesByName(filePath, filename, files);
                            }
                        } else if (file === filename) {
                            files.push(filePath);
                        }
                    } catch (err) {
                        if (err.code !== 'EPERM' && err.code !== 'EBUSY' && err.code !== 'EACCES' && err.code !== 'ENOENT') {
                            throw err;
                        }
                    }
                }
            }
        } catch (err) {
            if (err.code !== 'EPERM' && err.code !== 'EACCES' && err.code !== 'ENOENT') {
                throw err;
            }
        }

        return files;
    }

    /**
     * Get all local disks volume names
     * @returns {Array<string>}
     */
    #getDisks() {
        const disks = [];

        const output = execSync('wmic logicaldisk get deviceid, volumename, description, mediatype').toString();
        const lines = output.trim().split('\r\n').slice(1);

        for (const line of lines) {
            const [_, volumeName, mediaType] = line.trim().split(/\s{2,}/);

            if (mediaType === '12') {
                disks.push(volumeName + '\\');
            }
        }

        return disks;
    };
}