const config_handler = require('./handleConfigFile');

module.exports = new class {
    /**
     * Get all installs for specific project
     * @param keyword {string}
     * @returns {Install[]}
     */
    get(keyword) {
        const projects = config_handler.getAllComponentsConfig();
        if (projects == null) {
            return null;
        }

        const project = projects.find(x => x.keywords.includes(keyword));
        if (project == null) {
            return [];
        }

        return project.install;
    }

    /**
     * Get all installs for all projects
     * @returns {Config[]}
     */
    getProjectsWithInstalls() {
        const projects = config_handler.getAllComponentsConfig();
        if (projects == null) {
            return null;
        }

        return projects.filter(x => x.install != null);
    }
}