import json from '../common/helper/json.js';
import SchemaValidator, {SchemaTypes} from "../common/validators/schema-validator.js";

import {Config} from "../common/models/dot-dever/external.js";

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
     * Get raw config
     * @returns {*}
     */
    raw() {
        return json.read(this.#filePath);
    }

    /**
     * Get dever configuration
     * @returns {Config}
     */
    get() {
        const config = json.read(this.#filePath);
        if (Object.keys(config).length === 0) {
            return {
                projects: [],
                skipAllHashChecks: false
            };
        }

        const result = SchemaValidator.validate(SchemaTypes.DotDever, 1, config);
        if (!result) {
            throw new Error('.dever failed parsing. Please verify structure of the config file');
        }

        return {
            projects: config?.projects?.map(this.#projectMap) ?? [],
            skipAllHashChecks: config?.skipAllHashChecks ?? false,
            lastVersionCheckMs: config?.lastVersionCheckMs ?? 0,
            latestVersion: config?.latestVersion ?? null
        };
    }

    /**
     * Save configuration
     * @param config {Config}
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
     * Map project
     * @param project
     * @return {{path, hasRunActions: (HasRunAction[]|[]|*|*[]), lastHash: (string|null|*), skipHashCheck: (boolean|*|boolean)}}
     */
    #projectMap(project) {
        return {
            path: project.path,
            lastHash: project?.lastHash,
            skipHashCheck: project?.skipHashCheck ?? false,
            hasRunActions: project?.hasRunActions ?? []
        }
    }
}
