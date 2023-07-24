import configLoader from "../configuration/config-loader.js";

import dotDever from "./dot-dever.js";

import chalk from "chalk";

export default new class {
    #migrationVersion = 2;

    migrate() {
        const config = configLoader.get();
        if (config != null && config.migrationVersion >= this.#migrationVersion) {
            return true;
        }

        if (dotDever.migrate(config, this.#migrationVersion)) {
            return true;
        } else {
            console.error(chalk.redBright('Migration of .dever failed validation.'));
            console.error('Please downgrade to previously installed version of dever and create github issue');

            return false;
        }
    }
}
