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
            method: 'GET'
        };

        https.request(options, (res) => {
            let data = ''

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                // TODO: Compare against current version
                console.log(chalk.greenBright(`\n\ndever ${JSON.parse(data)} is now available`) + `\n\nUse ${chalk.blueBright('npm update -g @czprz/dever')} for upgrading to latest version`)
            });

        }).on("error", (err) => {
            console.log("Error: ", err)
        }).end()
    }
}