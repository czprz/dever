import path from "path";
import json from "../helper/json.js";

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
            case 'true':
            case 'false':
            case 1:
            case 0:
                return true;
            default:
                return false;
        }
    }

    isValidPathToDeverJson(file) {
        if (file == null || 'dever.json' !== path.basename(file)) {
            return false;
        }

        const content = json.read(file);
        if (content == null) {
            return false;
        }

        return content.version === 2
    }
}