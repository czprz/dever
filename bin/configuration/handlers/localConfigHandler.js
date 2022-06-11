import localConfig from "../local-config.js";
import typeValidator from "../../common/validators/typeValidator.js";

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
        const key = this.#getKeys(argv._[2]);
        const value = argv._[3];

        if (key == null || value == null) {
            console.warn(`Missing key or value. Please try again with 'dever config set [key] [value]'`);
            return;
        }

        const config = localConfig.get();

        this.#setOrGetConfig('set', config, key, value);

        localConfig.write(config);
    }

    /**
     * Gets configuration
     * @param argv
     */
    #getConfig(argv) {
        const key = this.#getKeys(argv._[2]);

        if (key == null) {
            console.warn(`Missing key. Please try again with 'dever config get [key]'`);
            return;
        }

        const config = localConfig.get();

        this.#setOrGetConfig('get', config, key, null);
    }

    /**
     * Either sets or gets configuration
     * @param state {'get' | 'set'}
     * @param config {LocalConfig}
     * @param key {string[]}
     * @param value {string | null}
     */
    #setOrGetConfig(state, config, key, value) {
        switch (key[0]) {
            case "projects":
                this.#setOrGetConfigProjects(state, config, key, value);
                break;
            case "skipallhashchecks":
                this.#executor(state,
                    () => {
                        if (!typeValidator.isValidBoolean(value)) {
                            console.warn(chalk.red(`Could not set '${value}' to 'skipAllHashChecks'. Must a boolean. (true, false, 0 or 1)`));
                            return;
                        }

                        config.skipAllHashChecks = value === 'true' || value === '1';
                    },
                    () => {
                        console.log(config.skipAllHashChecks);
                    });
                break;
            default:
                console.warn('Key is not supported');
        }
    }

    /**
     * Either sets or gets project configuration
     * @param state {'get' | 'set'}
     * @param config {LocalConfig}
     * @param key {string[]}
     * @param value {unknown}
     */
    #setOrGetConfigProjects(state, config, key, value) {
        const id = +key[1];
        if (isNaN(id) || id > (config.projects.length - 1) || id < 0) {
            console.warn(chalk.red(`Could not set project with '${value}' due to '${key[1]}' being an invalid projects id`));
            return;
        }

        switch (key[2]) {
            case "path":
                this.#executor(state,
                    () => {
                        if (!typeValidator.isValidPathToDeverJson(value)) {
                            console.warn(chalk.red(`Could not set '${value}' to 'project.${id}.path'. Must be a valid path to a dever.json file`));
                            return;
                        }

                        config.projects[id].path = value;
                    }, () => {
                        console.log(config.projects[id].path);
                    });
                break;
            case "skiphashcheck":
                this.#executor(state,
                    () => {
                        if (!typeValidator.isValidBoolean(value)) {
                            console.warn(chalk.red(`Could not set '${value}' to 'project.${id}.skipHashCheck'. Must a boolean. (true, false, 0 or 1)`));
                            return;
                        }

                        config.projects[id].skipHashCheck = value === 'true' || value === '1';
                    }, () => {
                        console.log(config.projects[id].skipHashCheck);
                    });
                break;
            default:
                console.warn('Key is not supported');
        }
    }

    /**
     * Handle switching between set and get
     * @param state {'get' | 'set'}
     * @param set {Function}
     * @param get {Function}
     */
    #executor(state, set, get) {
        if (state === 'set') {
            set();
            return;
        }

        get();
    }

    /**
     * Transforms string into a number of a keys
     * @param arg {string}
     * @returns string[]
     */
    #getKeys(arg) {
        return arg.split('.').map(x => x.toLowerCase());
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