import path from 'path';
import fs from 'fs';
import os from 'os';
import chalk from 'chalk';

import json from '../common/helper/json';

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

    /**
     * Get dever configuration
     * @returns {LocalConfig}
     */
    get() {
        const config = json.read(this.#filePath);
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
        const config = json.read(this.#filePath);
        return config == null ?
            null :
            config.components.map(x => json.read(x));
    }

    /**
     * Get component configuration
     * @param filePath {string}
     * @returns {null|Config}
     */
    getProject(filePath) {
        const project = json.read(this.#filePath);

        return project == null ?
            null :
            {...project, location: path.dirname(filePath)};
    }
}
