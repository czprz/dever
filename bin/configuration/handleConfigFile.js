const path = require("path");
const fs = require("fs");

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
        const fs = require('fs');
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
    getAllComponentsConfig() {
        const config = this.#readJson(this.#filePath);
        return config == null ?
            null :
            config.components.map(x => this.#readJson(x));
    }

    /**
     * Get component configuration
     * @param filePath
     * @returns {null|Config}
     */
    getComponentConfig(filePath) {
        const component = this.#readJson(filePath);

        return component == null ?
            null :
            {...component, location: path.dirname(filePath)};
    }

    /**
     * Get and parse file
     * @param filePath {string}
     * @returns {null|LocalConfig|Config}
     */
    #readJson(filePath) {
        try {
            let rawData = fs.readFileSync(filePath);
            return JSON.parse(rawData);
        } catch (e) {
            switch (e.code) {
                case "ENOENT":
                    return null;
                default:
                    throw e;
            }
        }
    }
}
