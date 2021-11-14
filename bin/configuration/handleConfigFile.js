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
     * Define which handler you're using ('docker-container','powershell-command','powershell-script','docker-compose','mssql')
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
     * @return {Container | null}
     */
    container;

    /**
     *  Currently only used to select between mssql options
     *  @return {string | null}
     */
    option;

    /**
     * Custom options that will be passed along to dependency
     * @return {Option[] | null}
     */
    options;

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

class Container {
    /**
     * Name
     * @var {string}
     */
    name;

    /**
     * Port mappings
     * @var {string[]}
     */
    ports;

    /**
     * Environment variables
     * @var {string[]}
     */
    variables;

    /**
     * Name of docker image
     * @var {string}
     */
    image;
}

class Option {
    /**
     * Check if dependency is allowed to execute without option
     * @return {boolean}
     */
    required;

    /**
     * Possibility for having an alias for the option
     * @Optional
     * @return {string}
     */
    alias;

    /**
     * Describe what this option will be used for
     * @return {string}
     */
    describe;

    /**
     * Replace specific area given in value area e.g. "__give__" if e.g. command is "docker run __give__"
     * @return {string}
     */
    replace;

    /**
     * Replace with contains the argument going to be passed e.g. '--new-command=$value' where value will be replaced with option value given
     * @return {string}
     */
    replaceWith;

    /**
     * Condition for which this option is allowed to receive a value
     * @return {OptionRule}
     */
    rule;
}

class OptionRule {
    /**
     * Check whether value being passed is as expected using regex match
     * @return {string}
     */
    match;

    /**
     * If condition check fails this message will be shown
     * @return {string}
     */
    message;
}
