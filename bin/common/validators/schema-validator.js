import v2 from "../schema/dever-json/v2.js";
import v1 from "../schema/dot-dever/v1.js";

import Ajv from "ajv";

"use strict";
export default new class {
    /**
     * Validate schema
     * @param type {SchemaTypes|string}
     * @param version {number}
     * @param json {string}
     * @return {boolean}
     */
    validate(type, version, json) {
        const key = this.#generateKey(type, version);

        switch(key) {
            case `${SchemaTypes.DotDever}-1`:
                return this.#validate(json, v1);
            case `${SchemaTypes.DeverJson}-2`:
                return this.#validate(json, v2);
            default:
                return false;
        }
    }

    /**
     * Runs AJV schema validation
     * @param json {string}
     * @param schema {object}
     * @returns {boolean}
     */
    #validate(json, schema) {
        const ajv = new Ajv();
        const validate = ajv.compile(schema);
        return validate(json);
    }

    #generateKey(type, version) {
        return type + '-' + version;
    }
}

export const SchemaTypes = {
    DotDever: "dot-dever",
    DeverJson: "dever-json"
}