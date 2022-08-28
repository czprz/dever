"use strict";
export default new class {
    #supportedVersion = 1;

    /**
     * @param configs {Project|Project[]}
     * @return {boolean}
     */
    supported(configs) {
        if (Array.isArray(configs)) {
            return configs.every(x => x.version === this.#supportedVersion);
        }

        return configs.version === this.#supportedVersion;
    }

    /**
     * Check if version is supported
     * @param version {number}
     * @returns {boolean}
     */
    supportedVersion(version) {
        return version === this.#supportedVersion;
    }
}
