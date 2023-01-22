import ConfigFacade from "../../configuration/facades/config-facade.js";
import https from 'https';

export default new class {
    /**
     * Check for updates and notifies if there is a new version
     */
    check() {
        // TODO: Figure out the best way of executing this
        const now = Date.now();
        const lastVersionCheckMs = ConfigFacade.getSingle(config => config?.lastVersionCheckMs) ?? now;

        if (now > lastVersionCheckMs + 86400000) {
            this.#checkForUpdates();
        }

        // TODO: Testing with and without lastVersionCheckMs in .dever

        ConfigFacade.update(config => {
            config.lastVersionCheckMs = now;
        });
    }

    #checkForUpdates() {
        const options = {
            url: 'https://api.dever.land/dever/latest/version',
            timeout: 100,
        };

        https.get(options, res => {
            res.on('data', data => {
                console.log(data.toString());
                // TODO: Improve message to user
            });
        });
    }
}