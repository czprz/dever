import configLoader from "../configuration/config-loader.js";

import dotDever from "./dot-dever.js";

export default new class {
    #migrationVersion = 2;

    migrate() {
        const config = configLoader.get();
        if (config == null || config.migrationVersion >= this.#migrationVersion) {
            return;
        }

        dotDever.migrate(config);
    }
}