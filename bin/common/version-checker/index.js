import ConfigFacade from "../../configuration/facades/config-facade.js";
import https from 'https';
import chalk from "chalk";

export default new class {
    /**
     * Check for updates and notifies if there is a new version
     */
    check() {
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

        const request = https.request(options, (res) => {
            let data = ''

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                const parsed = JSON.parse(data);
                const version = this.#getVersion(parsed);

                if (version == null) {
                    return;
                }

                // TODO: Fix this
                const currentVersion = this.#getVersion('1.0.0');
                if (currentVersion.major > version.major ||
                    currentVersion.major === version.major && currentVersion.minor > version.minor ||
                    currentVersion.major === version.major && currentVersion.minor === version.minor && currentVersion.patch > version.patch) {
                    console.log(`\n\n${chalk.greenBright(`dever ${version} is now available`)}`);
                    console.log(`\n\nUse ${chalk.blueBright('npm update -g @czprz/dever')} for upgrading to latest version`);
                }
            });

        }).on("error", (err) => {
            console.log("Error: ", err)
        }).on('timeout', () => {
            request?.destroy();
        }).end()
    }

    /**
     * Get version from string
     * @param str {string}
     * @return {{patch: *, major: *, minor: *}|null}
     */
    #getVersion(str) {
        const match = str.match(/^(\d+).(\d+).(\d+)$/);
        if (match == null || match.length !== 4) {
            return null;
        }

        return {
            major: match[1],
            minor: match[2],
            patch: match[3],
        };
    }
}