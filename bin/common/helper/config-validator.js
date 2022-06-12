import constants from '../constants.js';
import fs from 'fs';

"use strict";
export default new class {
    /**
     * Validate configuration
     * @param config {Project}
     * @return {boolean}
     */
    validate(config) {
        return config.keywords.every(x => !constants.predefinedKeys.includes(x.toLowerCase()));
    }

    /**
     * Validate json
     * @param json {string}
     */
    validateJson(json) {
        // Todo: Missing implementation
    }

    /**
     * Validate json file
     * @param file {string}
     * @return {ConfigValidation}
     */
    validateFile(file) {
        try {
            const config = this.#getJson(file);
            if (this.validate(config)) {
                return {status: true};
            }

            return {status: false, message: `One or more keywords are conflicting with the pre-defined keys. ('${constants.predefinedKeys.join("','")}')` };
        } catch (e) {
            switch(e.code) {
                case "ENOENT":
                case "EISDIR":
                    return {status: false, message: `Could not find '${file}'. Please check if file path is correct.`};
                default:
                    return {status: false, message: "Something went wrong. Most likely due to JSON being wrongly formatted!"};
            }
        }
    }

    /**
     * Get json from file
     * @param file {string}
     * @returns {Project}
     */
    #getJson(file) {
        const content = fs.readFileSync(file);
        return this.#convertToJson(content);
    }

    /**
     *
     * @param content {null|Buffer}
     * @return {Project}
     */
    #convertToJson(content) {
        try {
            return JSON.parse(content);
        } catch (e) {
            throw e;
        }
    }
}

class ConfigValidation {
    /**
     * @return {boolean}
     */
    status;

    /**
     * @return {string}
     */
    message;
}