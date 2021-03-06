import typeValidator from "../common/validators/type-validator.js";
import projectConfigFacade from "./facades/project-config-facade.js";
import localConfig from "./local-config.js";

import chalk from "chalk";

export default new class {
    /**
     *
     * @param unstructuredKey {string}
     * @param value {string}
     */
    update(unstructuredKey, value) {
        const key = this.#keyGenerator(unstructuredKey);
        switch (key.case) {
            case "skipallhashchecks":
                this.#saveSkipAllHashChecks(unstructuredKey, value);
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
     *
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

    #saveSkipAllHashChecks(key, value) {
        if (!typeValidator.isValidBoolean(value)) {
            console.warn(chalk.red(`Could not set '${value}' to '${key}'. Must a boolean. (true, false, 0 or 1)`));
            return;
        }

        const config = localConfig.get();
        config.skipAllHashChecks = value === 'true' || value === '1';
        localConfig.write(config);
    }
}