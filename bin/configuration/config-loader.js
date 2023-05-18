import os from "os";
import path from "path";
import json from "../common/helper/json.js";

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
    get() {
        return json.read(this.#filePath);
    }

    /**
     * Save configuration
     * @param config {*}
     */
    write(config) {
        json.write(this.#filePath, config);
    }

    /**
     * Get file path to .dever
     * @returns {string}
     */
    getFilePath() {
        return this.#filePath;
    }
}