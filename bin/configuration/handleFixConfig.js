const config_handler = require('./handleConfigFile');

module.exports = new class {
    /**
     * Get all fix commands
     * @returns {null|Fix[]}
     */
    getAll() {
        const components = config_handler.getAllComponentsConfig();
        const listOfFix = [];

        for (const fixes of components.map(x => x.fix)) {
            if (fixes == null) {
                continue;
            }

            for (const fix in fixes) {
                listOfFix.push({...fixes[fix], key: fix});
            }
        }

        return listOfFix.length === 0 ? null : listOfFix;
    }

    /**
     * Get specific fix command
     * @param problem {string}
     * @returns {null|Fix[]}
     */
    get(problem) {
        const fix = this.getAll();
        if (fix == null) {
            return null;
        }

        return fix.filter(x => x.key === problem);
    }
}