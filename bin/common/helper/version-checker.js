module.exports = new class {
    #supportedVersion = 2;

    /**
     * @param configs {Config|Config[]}
     * @return {boolean}
     */
    supported(configs) {
        if (Array.isArray(configs)) {
            return configs.every(x => x.version === this.#supportedVersion);
        }

        return configs.version === this.#supportedVersion;
    }

    /**
     * @param configs {Config[]}
     * @return {Config[]}
     */
    getOnlyUnsupported(configs) {
        return configs.filter(x => x.version !== this.#supportedVersion);
    }
}