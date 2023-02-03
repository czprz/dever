import ConfigFacade from "../../configuration/facades/config-facade.js";
import https from 'https';
import chalk from "chalk";

import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

export default new class {
    /**
     * Check for updates and notifies if there is a new version
     */
    async check() {
        const lastVersionCheckMs = ConfigFacade.getSingle(config => config?.lastVersionCheckMs);
        const now = Date.now();

        if (now > lastVersionCheckMs + 86400000) {
            this.#checkForUpdates();
        }

        ConfigFacade.update(config => {
            config.lastVersionCheckMs = now;
        });
    }

    /**
     * Check for updates
     */
    #checkForUpdates() {
        const options = {
            hostname: 'api.dever.land',
            path: '/version/latest',
            method: 'GET',
            timeout: 100
        };

        https.request(options, (res) => {
            let data = ''

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', async () => {
                const parsed = JSON.parse(data);
                const version = this.#getVersion(parsed);
                if (version == null) {
                    return;
                }

                const currentVersion = await this.#getActualVersion();
                if (currentVersion == null) {
                    return;
                }

                if (currentVersion.major > version.major ||
                    currentVersion.major === version.major && currentVersion.minor > version.minor ||
                    currentVersion.major === version.major && currentVersion.minor === version.minor && currentVersion.patch > version.patch) {
                    console.log(`\n\n${chalk.greenBright(`dever ${version.full} is now available`)}`);
                    console.log(`\nUse ${chalk.blueBright('npm update -g @czprz/dever')} for upgrading to latest version`);
                }
            });
        }).end();
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