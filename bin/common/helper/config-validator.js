import constants from '../constants.js';
import json from "./json.js";
import v2 from "../schema/dever-json/v2.js";

import Ajv from "ajv";

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
     * Validate json file
     * @param file {string}
     * @return {ConfigValidation}
     */
    validateFile(file) {
        try {
            /**
             * @type {Project}
             */
            const config = json.read(file);
            if (config == null) {
                return {status: false, message: 'could not find any dever.json at location'};
            }

            const ajv = new Ajv();
            const validate = ajv.compile(v2);
            if (!validate(config)) {
                return {status: false, schemaErrors: validate.errors};
            }

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
}

class ConfigValidation {
    /**
     * @type {boolean}
     */
    status;

    /**
     * @type {string|?}
     */
    message;

    /**
     * @type {object[]|?}
     */
    schemaErrors;
}