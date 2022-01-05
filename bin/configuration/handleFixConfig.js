const config_handler = require('./handleConfigFile');

module.exports = new class {
    /**
     * Find specific fix
     * @param keyword {string}
     * @param fixKey {string}
     * @returns {Fix}
     */
    getFix(keyword, fixKey) {
        return config_handler.getAllComponentsConfig()?.find(x => x.fix != null && x.keywords.includes(keyword))?.fix.find(x => x.key === fixKey);
    }

    /**
     * Get all projects which does not have an empty fix section
     * @returns {null|Config[]}
     */
    getAllProjectsWithFix() {
        return config_handler.getAllComponentsConfig()?.filter(x => x.fix != null);
    }

    /**
     * Get all fixes for specific project
     * @param keyword {string}
     * @returns {null|Config}
     */
    getProjectWithFixes(keyword) {
        return config_handler.getAllComponentsConfig()?.find(x => x.fix != null && x.keywords.includes(keyword));

    }
}