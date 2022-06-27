import json from '../common/helper/json.js';
import SchemaValidator, {SchemaTypes} from "../common/validators/schema-validator.js";

import path from 'path';
import os from 'os';

"use strict";
export default new class {
    #fileName = '.dever';

    #root;
    #filePath;

    constructor() {
        this.#root = os.homedir();
        this.#filePath = path.join(this.#root, this.#fileName);
    }

    /**
     * Get dever configuration
     * @returns {LocalConfig}
     */
    get() {
        const config = json.read(this.#filePath) ?? {projects: [], skipAllHashChecks: false};
        // Todo: Temporary fix. Need to figure out a better way of handling upgrades of .dever
        if (config.components != null) {
            return {projects: [], skipAllHashChecks: false};
        }

        const result = SchemaValidator.validate(SchemaTypes.DotDever, 1, config);
        if (!result) {
            throw new Error('.dever failed parsing. Please verify structure of the config file');
        }

        return config;
    }

    /**
     * Save configuration
     * @param config {LocalConfig}
     */
    write(config) {
        json.write(this.#filePath, config);
    }

    /**
     * Get file path to dever.json
     * @return {string}
     */
    getFilePath() {
        return this.#filePath;
    }
}
