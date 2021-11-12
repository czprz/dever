module.exports = {
    get: get,
    getComponentDeverJsonConfig: getComponentDeverJsonConfig,
    write: write
}

const path = require("path");
const fs = require("fs");

const fileName = 'dever_config.json';

const root = path.join(path.dirname(fs.realpathSync(__filename)), '../');
const filePath = path.join(root, fileName);

function readJson(filePath) {
    try {
        let rawData = fs.readFileSync(filePath)
        return JSON.parse(rawData);
    }
    catch (e) {
        switch (e.code) {
            case "ENOENT":
                console.error(`Could not find '${filePath}' please run 'dever init' again.`);
                return null;
            default:
                throw e;
        }
    }
}

/**
 *
 * @returns {LocalConfig}
 */
function get() {
    const config = readJson(filePath);

    if (config == null) {
        throw 'Could not find configuration';
    }

    return config;
}

/**
 * Save configuration
 * @param config {LocalConfig}
 */
function write(config) {
    const fs = require('fs');
    let data = JSON.stringify(config);

    fs.writeFileSync(filePath, data, (err) => {
        if (err) {
            throw err;
        }

        console.log(data);
        console.log('Configuration updated');
    });
}

/**
 * Get component with location
 * @param filePath
 * @returns {null|Config}
 */
function getComponentDeverJsonConfig(filePath) {
    const component = readJson(filePath);
    if (component == null) {
        return null;
    }

    component['location'] = path.dirname(filePath);

    return component;
}

class LocalConfig {
    /**
     * @return {Config[]}
     */
    components;
}

class Config {
    /**
     * @return {string}
     */
    version;

    /**
     * @return {string}
     */
    component;

    /**
     * @return {string[]}
     */
    keywords;

    /**
     * @return {Dependency[]}
     */
    dependencies;

    /**
     * @return {string}
     */
    location;
}

class Dependency {
    /**
     * Define which handler you're using ('docker-container','powershell-command','powershell-script','docker-compose','sql-db')
     * @return {string}
     */
    type;

    /**
     * @return {string}
     */
    name;

    /**
     * @return {string}
     */
    file;

    /**
     * @return {string}
     */
    command;

    /**
     * Container object only used when type is 'docker-container'
     * @return {Container}
     */
    container;

    /**
     * Sql object only used when type is 'database'
     * @return {Database}
     */
    database;

    /**
     * @return {Wait}
     */
    wait;

    /**
     * Informs whether a dependency needs to be run as elevated user
     * @return {boolean}
     */
    runAsElevated;
}

class Wait {
    /**
     * Choose when wait should occur ('before', 'after')
     * @return {string}
     */
    when;

    /**
     * Choose for how long it should wait
     * @return {number}
     */
    time; // in milliseconds
}
