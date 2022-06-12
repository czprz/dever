import path from 'path';
import os from 'os';

import json from '../common/helper/json.js';

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
        return json.read(this.#filePath) ?? {projects: []};
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
