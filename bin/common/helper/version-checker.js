"use strict";
export default new class {
    #supportedVersion = 3;

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
     * @param configs {Project[]}
     * @return {Project[]}
     */
    getOnlyUnsupported(configs) {
        return configs.filter(x => x.version !== this.#supportedVersion);
    }
}
