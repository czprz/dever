import json from '../common/helper/json.js';
import v1 from "../common/schema/dot-dever/v1.js";

import Ajv from "ajv";
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
        const config = json.read(this.#filePath) ?? {projects: []};

        const ajv = new Ajv();
        const validate = ajv.compile(v1);
        if (!validate(config)) {
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
