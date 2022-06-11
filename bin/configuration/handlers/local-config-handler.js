import localConfig from "../local-config.js";
import configUpdater from "../config-updater.js";
import configGetter from "../config-getter.js";

import chalk from "chalk";

export default new class {
    /**
     * Generate default or component options
     * @param yargs {object}
     * @returns {*|Object}
     */
    options(yargs) {
        return yargs
            .command({
                command: 'set',
                describe: 'Sets config key to value provided',
                handler: (argv) => {
                    this.#setConfig(argv);
                }
            })
            .command({
                command: 'get',
                describe: 'Show value of config key',
                handler: (argv) => {
                    this.#getConfig(argv);
                }
            })
            .command({
                command: 'list',
                describe: 'Show all project locations and settings',
                handler: () => {
                    this.#listConfig();
                }
            })
            .command({
                command: 'location',
                describe: 'Show location of dever configuration file',
                handler: () => {
                    this.#showLocation();
                }
            });
    }

    /**
     * Show location of dever configuration file
     */
    #showLocation() {
        const filePath = localConfig.getFilePath();
        if (filePath == null) {
            console.error('Could not find dever.json');
            return;
        }

        console.log(filePath);
    }

    #listConfig() {
        const config = localConfig.get();

        this.#listArrayOrObject(null, null, config);
    }

    #listArrayOrObject(parent, key, config) {
        for (const property in config) {
            if (property === 'lastHash') {
                continue;
            }

            if (parent === '') {
                key = null;
            }

            key = key == null ? property : parent + '.' + property;

            if (Array.isArray(config[property]) || typeof config[property] === 'object') {
                parent = key;
                this.#listArrayOrObject(parent, key, config[property]);
                parent = this.#removeFromEnd(parent);
                continue;
            }

            console.log(`${chalk.yellow(key)}: ${config[property]}`);
        }
    }

    /**
     * Sets configuration
     * @param argv
     */
    #setConfig(argv) {
        const key = argv._[2];
        const value = argv._[3];

        if (key == null || value == null) {
            console.warn(`Missing key or value. Please try again with 'dever config set [key] [value]'`);
            return;
        }

        configUpdater.update(key, value);
    }

    /**
     * Gets configuration
     * @param argv
     */
    #getConfig(argv) {
        const key = argv._[2];

        if (key == null) {
            console.warn(`Missing key. Please try again with 'dever config get [key]'`);
            return;
        }

        configGetter.get(key);
    }

    /**
     * Remove last item from string
     * @param parent {string}
     */
    #removeFromEnd(parent) {
        let arr = parent.split('.');
        arr.pop();
        return arr.join('.');
    }
}