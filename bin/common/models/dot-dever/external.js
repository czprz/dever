export class Config {
    /**
     * @return {Project[]}
     */
    projects;

    /**
     * Skip all dever.json hash checks
     * @type {boolean}
     */
    skipAllHashChecks;
}

export class Project {
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

    /**
     * Skip all run once actions if nothing has changed
     * @type {HasRunAction[]}
     */
    hasRunActions;
}

export class HasRunAction {
    /**
     * @type {string}
     */
    name;

    /**
     * @type {boolean}
     */
    hasRun;

    /**
     * @type {string}
     */
    lastHash;

    /**
     * @param name {string}
     * @param hasRun {boolean}
     * @param lastHash {string}
     */
    constructor(name, hasRun, lastHash) {
        this.name = name;
        this.hasRun = hasRun;
        this.lastHash = lastHash;
    }
}