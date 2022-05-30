class LocalConfig {
    /**
     * @return {LocalProject[]}
     */
    projects;
}

class LocalProject {
    /**
     * Location of the projects dever.json
     * @type {string}
     */
    path;

    /**
     * Last known hash of dever.json
     * @type {string}
     */
    lastHash;
}