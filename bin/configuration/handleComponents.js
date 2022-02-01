module.exports = {
    getComponent: getComponent,
    getAllComponents: getAllComponents,
    clearComponents: clearComponents,
    addComponent: addComponent
}

const config_handler = require('./handleConfigFile');

/**
 * Gets all components and their dever.json configuration
 * @returns LocalConfig
 */
function get() {
    const config = config_handler.get();
    if (config.components == null || config.components.length === 0) {
        return null;
    }

    return {
        components: config.components.map(x => config_handler.getComponentConfig(x))
    }
}

/**
 * Gets only one component specifically looking through component keywords found in dever.json
 * @param keyword
 * @returns Config
 */
function getComponent(keyword) {
    let config = get();
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
 * Gets all components from dever_config.json
 * @returns {Config[] | null}
 */
function getAllComponents() {
    const config = get();
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
 * Clears components from dever_config.json
 * @return void
 */
function clearComponents() {
    const config = config_handler.get();

    config.components = [];

    config_handler.write(config);
}

/**
 * Adds location for component dever.json to dever_config.json components
 * @param file string
 */
function addComponent(file) {
    const config = config_handler.get();

    config.components.push(file);

    config_handler.write(config);
}
