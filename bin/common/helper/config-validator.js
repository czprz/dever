const constants = require('../constants');
const fs = require("fs");

module.exports = new class {
    /**
     * Validate configuration
     * @param config {Config}
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
                    return {status: false, message: `Could not find '${file}', please check if file path is correct.`};
                default:
                    return {status: false, message: "Something unexpected went wrong.."};
            }
        }
    }

    /**
     * Get json from file
     * @param file {string}
     * @returns {Config}
     */
    #getJson(file) {
        const content = fs.readFileSync(file);
        return this.#convertToJson(content);
    }

    /**
     *
     * @param content {null|Buffer}
     * @return {Config}
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