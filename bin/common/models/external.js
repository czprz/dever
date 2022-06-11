class LocalConfig {
    /**
     * @return {LocalProject[]}
     */
    projects;

    /**
     * Skip all dever.json hash checks
     * @type {boolean}
     */
    skipAllHashChecks;
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

    /**
     * Skip hash check of dever.json
     * @type {boolean}
     */
    skipHashCheck;
}