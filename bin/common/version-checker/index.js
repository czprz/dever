import ConfigFacade from "../../configuration/facades/config-facade.js";
import https from 'https';
import chalk from "chalk";

import path, {dirname} from 'path';
import {fileURLToPath} from 'url';
import fs from 'fs';

export default new class {
    /**
     * Checks for updates
     * @returns {Promise<void>}
     */
    async fetch() {
        if (this.#conditionForVersionChecking()) {
            this.#checkForUpdates();
        }
    }

    /**
     * Notifies if there is a new version
     */
    async inform() {
        if (!this.#conditionForVersionChecking()) {
            return;
        }

        const version = ConfigFacade.getSingle((config) => config.latestVersion);
        if (version === "0.0.0") {
            return;
        }

        const newestVersion = this.#getVersion(version);
        if (newestVersion == null) {
            return;
        }

        const currentVersion = await this.#getActualVersion();
        if (currentVersion == null) {
            return;
        }

        if (newestVersion.major > currentVersion.major ||
            newestVersion.major === currentVersion.major && newestVersion.minor > currentVersion.minor ||
            newestVersion.major === currentVersion.major && newestVersion.minor === currentVersion.minor && newestVersion.patch > currentVersion.patch) {
            console.log(`\n\n${chalk.greenBright(`@czprz/dever ${newestVersion.full} is now available`)}`);
            console.log(`\nUse ${chalk.blueBright('npm update -g @czprz/dever')} for upgrading to latest version`);
        }

        ConfigFacade.update(config => {
            config.lastVersionCheckMs = Date.now();
        });
    }

    #conditionForVersionChecking() {
        const lastVersionCheckMs = ConfigFacade.getSingle(config => config?.lastVersionCheckMs);
        const now = Date.now();

        return now > lastVersionCheckMs + 86400000;
    }

    /**
     * Check for updates
     */
    #checkForUpdates() {
        const options = {
            hostname: 'api.dever.land',
            path: '/dever/version/latest',
            method: 'GET',
            timeout: 100
        };

        https.request(options, (res) => {
            let data = ''

            res.on('data', (chunk) => {
                data += chunk;
                const parsed = JSON.parse(data);

                const newestVersion = this.#getVersion(parsed);
                if (newestVersion == null) {
                    return;
                }

                ConfigFacade.update((config) => {
                    config.latestVersion = newestVersion.full;
                });
            });
        })
            .on('error', () => {})
            .end();
    }

    /**
     * Get version from string
     * @param str {string}
     * @return {{patch: *, major: *, minor: *, full: string}|null}
     */
    #getVersion(str) {
        const match = str.match(/^(\d+).(\d+).(\d+)/);
        if (match == null || match.length !== 4) {
            return null;
        }

        return {
            major: match[1],
            minor: match[2],
            patch: match[3],
            full: str
        };
    }

    /**
     * Get actual version
     * @return {Promise<{patch: *, major: *, minor: *, full: string}|null>}
     */
    async #getActualVersion() {
        const appRoot = path.join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
        const packageJsonPath = `${appRoot}/package.json`;

        const packageJsonString = await fs.promises.readFile(packageJsonPath, 'utf8');
        const packageJson = JSON.parse(packageJsonString);

        return this.#getVersion(packageJson?.version);
    }
}