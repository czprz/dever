const path = require("path");
const fs = require("fs");
const chalk = require('chalk');

"use strict";
module.exports = new class {
    #fileName = '.dever';

    #root;
    #filePath;

    constructor() {
        this.#root = require('os').homedir();
        this.#filePath = path.join(this.#root, this.#fileName);
    }

    /**
     * Save configuration
     * @param config {LocalConfig}
     */
    write(config) {
        let data = JSON.stringify(config);

        fs.writeFileSync(this.#filePath, data, (err) => {
            if (err) {
                throw err;
            }

            console.log(data);
            console.log('Configuration updated');
        });
    }

    /**
     * Get file path to dever.json
     * @return {string}
     */
    getFilePath() {
        return this.#filePath;
    }

    /**
     * Get dever configuration
     * @returns {LocalConfig}
     */
    get() {
        const config = this.#readJson(this.#filePath);
        if (config == null) {
            return null;
        }

        return config;
    }

    /**
     * Get all configuration for all components
     * @returns {null|Config[]}
     */
    getProjects() {
        const config = this.#readJson(this.#filePath);
        return config == null ?
            null :
            config.components.map(x => this.#readJson(x));
    }

    /**
     * Get component configuration
     * @param filePath {string}
     * @returns {null|Config}
     */
    getProject(filePath) {
        const project = this.#readJson(filePath);

        return project == null ?
            null :
            {...project, location: path.dirname(filePath)};
    }

    /**
     * Get and parse file
     * @param filePath {string}
     * @returns {null|LocalConfig|Config}
     */
    #readJson(filePath) {
        try {
            const rawData = fs.readFileSync(filePath, {encoding: 'utf8'});
            return JSON.parse(rawData);
        } catch (e) {
            switch (e.code) {
                case "ENOENT":
                    return null;
                default:
                    console.error(chalk.redBright(`Could not parse '${filePath}' due to json formatting.`));
                // Todo: Add exception to log file
            }
        }
    }
}
