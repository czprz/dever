import typeValidator from "../common/validators/type-validator.js";
import projectConfigFacade from "./facades/project-config-facade.js";
import ConfigFacade from "./facades/config-facade.js";

import chalk from "chalk";

export default new class {
    /**
     * Update .dever configuration
     * @param unstructuredKey {string}
     * @param value {string}
     */
    update(unstructuredKey, value) {
        const key = this.#keyGenerator(unstructuredKey);
        switch (key.case) {
            case "skipallhashchecks":
                this.#saveSkipAllHashChecks(unstructuredKey, value);
                break;
            case 'lastversioncheckms':
                this.#saveLastVersionCheck(unstructuredKey, value);
                break;
            case "latestversion":
                this.#saveLatestVersion(unstructuredKey, value);
                break;
            case "migrationversion":
                this.#saveMigrationVersion(unstructuredKey, value);
                break;
            case "projects.n.path":
                this.#savePath(key.id, unstructuredKey, value);
                break;
            case "projects.n.skiphashcheck":
                this.#saveSkipHashCheck(key.id, unstructuredKey, value);
                break;
            default:
                console.error('Unsupported key');
        }
    }

    /**
     * Generate keys
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
     * Validates and saves project skipHashCheck
     * @param id {number}
     * @param key {string}
     * @param value {unknown}
     */
    #saveSkipHashCheck(id, key, value) {
        if (!typeValidator.isValidBoolean(value)) {
            console.warn(chalk.red(`Could not set '${value}' to '${key}'. Must a boolean. (true, false, 0 or 1)`));
            return;
        }

        projectConfigFacade.update(id, (project) => {
            project.skipHashCheck = value === 'true' || value === '1';
        });
    }

    /**
     * Validates and then saves
     * @param id {number}
     * @param key {string}
     * @param value {unknown}
     */
    #savePath(id, key, value) {
        if (!typeValidator.isValidPathToDeverJson(value)) {
            console.warn(chalk.red(`Could not set '${value}' to '${key}'. Must be a valid path to a dever.json file`));
            return;
        }

        projectConfigFacade.update(id, (project) => {
            project.path = value;
        });
    }

    /**
     * Save global hash check
     * @param key {string}
     * @param value {string}
     */
    #saveSkipAllHashChecks(key, value) {
        if (!typeValidator.isValidBoolean(value)) {
            console.warn(chalk.red(`Could not set '${value}' to '${key}'. Must a boolean. (true, false, 0 or 1)`));
            return;
        }

        ConfigFacade.update(x => x.skipAllHashChecks = value === 'true' || value === '1')
    }

    #saveLastVersionCheck(unstructuredKey, value) {
        if (!typeValidator.isValidNumber(value)) {
            console.warn(chalk.red(`Could not set '${value}' to '${unstructuredKey}'. Must a number.`));
            return;
        }

        ConfigFacade.update(x => x.lastVersionCheckMs = +value)
    }

    #saveLatestVersion(unstructuredKey, value) {
        if (!typeValidator.isValidVersion(value)) {
            console.warn(chalk.red(`Could not set '${value}' to '${unstructuredKey}'. Must a valid version.`));
            return;
        }

        ConfigFacade.update(x => x.latestVersion = value)
    }

    #saveMigrationVersion(unstructuredKey, value) {
        if (!typeValidator.isValidNumber(value)) {
            console.warn(chalk.red(`Could not set '${value}' to '${unstructuredKey}'. Must a valid number.`));
            return;
        }

        if (value < 0) {
            console.warn(chalk.red(`Could not set '${value}' to '${unstructuredKey}'. Must be greater than or equal to 0.`));
            return;
        }

        ConfigFacade.update(x => x.migrationVersion = value)
    }
}