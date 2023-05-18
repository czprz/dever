import versionChecker from "../helper/version-checker.js";
import json from "../helper/json.js";

import path from "path";

"use strict";
export default new class {
    /**
     * Checks whether a value can be converted into a boolean
     * @param value {string}
     * @returns {boolean}
     */
    isValidBoolean(value) {
        if (value == null) {
            return false;
        }

        value = typeof value !== 'string' ? value : value.toLowerCase();

        switch (value) {
            case true:
            case false:
            case 'true':
            case 'false':
            case 1:
            case 0:
                return true;
            default:
                return false;
        }
    }

    /**
     * Validates that file path given is a valid dever.json
     * @param file {string}
     * @returns {boolean}
     */
    isValidPathToDeverJson(file) {
        if (file == null || 'dever.json' !== path.basename(file)) {
            return false;
        }

        const content = json.read(file);
        if (content == null) {
            return false;
        }

        return versionChecker.supportedVersion(content.version);
    }

    /**
     * Validates that a value is a number
     * @param value {*}
     * @return {boolean}
     */
    isValidNumber(value) {
        return !isNaN(value);
    }

    /**
     * Validates that a value is a valid version
     * @param value {string}
     * @returns {boolean}
     */
    isValidVersion(value) {
        const versionPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
        return versionPattern.test(value);
    }
}