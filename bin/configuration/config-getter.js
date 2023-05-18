import projectConfigFacade from "./facades/project-config-facade.js";
import ConfigFacade from "./facades/config-facade.js";

export default new class {
    /**
     * Show value of a key in .dever
     * @param unstructuredKey {string}
     */
    get(unstructuredKey) {
        const key = this.#keyGenerator(unstructuredKey);
        switch (key.case) {
            case "skipallhashchecks":
                this.#getSkipAllHashChecks();
                break;
            case "lastversioncheckms":
                this.#getLastVersionCheck();
                break;
            case "latestVersion":
                this.#getLatestVersion();
                break;
            case "migrationVersion":
                this.#getMigrationVersion();
                break;
            case "projects.n.path":
                this.#showProjectPath(key.id);
                break;
            case "projects.n.skiphashcheck":
                this.#showProjectSkipHashCheck(key.id);
                break;
            default:
                console.error('Unsupported key');
        }
    }

    /**
     * Generates key
     * @param unstructuredKey {string}
     * @return {{case: string, id?: number | null}}
     */
    #keyGenerator(unstructuredKey) {
        const pieces = unstructuredKey.split('.');
        switch (pieces[0]) {
            case 'projects':
                return {
                    case: pieces.map((x, i) => (i === 1 ? 'n' : x.toLowerCase())).join('.'),
                    id: +pieces[1]
                };
            default:
                return {
                    case: pieces[0].toLowerCase()
                };
        }
    }

    /**
     * Show current value of skipAllHashChecks
     */
    #getSkipAllHashChecks() {
        const skipAllHashChecks = ConfigFacade.getSingle(x => x.skipAllHashChecks)
        console.log(skipAllHashChecks);
    }

    /**
     * Shows current value of project path
     * @param id {number}
     */
    #showProjectPath(id) {
        const path = projectConfigFacade.getSingle(id, x => x.path);
        console.log(path);
    }

    /**
     * Shows current value of project skipHashCheck
     * @param id {number}
     */
    #showProjectSkipHashCheck(id) {
        const skipHashCheck = projectConfigFacade.getSingle(id, x => x.skipHashCheck);
        console.log(skipHashCheck);
    }

    #getLastVersionCheck() {
        const lastVersionCheckMs = ConfigFacade.getSingle(x => x.lastVersionCheckMs);
        console.log(lastVersionCheckMs);
    }

    #getLatestVersion() {
        const latestVersion = ConfigFacade.getSingle(x => x.latestVersion);
        console.log(latestVersion);
    }

    #getMigrationVersion() {
        const migrationVersion = ConfigFacade.getSingle(x => x.migrationVersion);
        console.log(migrationVersion);
    }
}