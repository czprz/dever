import DeverJsonV1 from "../schema/dever-json/v1.js";
import DotDeverV1 from "../schema/dot-dever/v1.js";

import Ajv from "ajv";

"use strict";
export default new class {
    /**
     * Validate schema
     * @param type {SchemaTypes|string}
     * @param version {number}
     * @param json {string|object}
     * @return {boolean}
     */
    validate(type, version, json) {
        const key = this.#generateKey(type, version);

        switch(key) {
            case `${SchemaTypes.DotDever}-1`:
                return this.#validate(json, DotDeverV1);
            case `${SchemaTypes.DeverJson}-1`:
                return this.#validate(json, DeverJsonV1);
            default:
                return false;
        }
    }

    /**
     * Runs AJV schema validation
     * @param json {string|object}
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