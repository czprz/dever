const config_handler = require('./handleConfigFile');

module.exports = new class {
    /**
     * Gets only one component specifically looking through component keywords found in dever.json
     * @param keyword
     * @returns Config
     */
    get(keyword) {
        let config = this.#getProjects();
        if (config == null) {
            return null;
        }

        let components = [];

        config.components.forEach(x => {
            if (x == null) {
                return;
            }

            if (x.keywords.includes(keyword)) {
                components.push(x);
            }
        })

        if (components.length > 1) {
            console.error('Components are not allowed to share keywords. Please fix this.');
            return null;
        }

        if (components.length === 0) {
            return null;
        }

        return components[0];
    }

    /**
     * Gets all projects from dever_config.json
     * @returns {Config[] | null}
     */
    getAll() {
        const config = this.#getProjects();
        if (config == null) {
            return null;
        }

        const components = [];

        config.components.forEach(x => {
            if (x == null) {
                return;
            }

            components.push(x);
        });

        return components;
    }

    /**
     * Removes all projects from dever_config.json
     * @return void
     */
    clear() {
        const config = config_handler.get();

        config.components = [];

        config_handler.write(config);
    }

    /**
     * Adds project to dever_config.json
     * @param file string
     */
    add(file) {
        const config = config_handler.get();

        config.components.push(file);

        config_handler.write(config);
    }

    /**
     * Removes project from dever_config.json
     * @param file {string}
     */
    remove(file) {
        const config = config_handler.get();

        const index = config.components.indexOf(file);
        if (index === -1) {
            return;
        }

        config.components.splice(index, 1);

        config_handler.write(config);
    }

    /**
     * Gets all components and their dever.json configuration
     * @returns LocalConfig
     */
    #getProjects() {
        const config = config_handler.get();
        if (config.components == null || config.components.length === 0) {
            return null;
        }

        return {
            components: config.components.map(x => config_handler.getComponentConfig(x))
        }
    }
}