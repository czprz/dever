const config_handler = require('./handleConfigFile');

"use strict";
module.exports = new class {
    /**
     * Get all installs for specific project
     * @param keyword {string}
     * @returns {Install[]}
     */
    get(keyword) {
        const projects = config_handler.getProjects();
        if (projects == null) {
            return null;
        }

        const project = projects.find(x => x.keywords.includes(keyword));
        if (project == null) {
            return [];
        }

        return project.install;
    }
}