import fs from "fs";
import projectConfigFacade from "../../configuration/facades/project-config-facade.js";
import hasher from "../helper/hasher.js";

export default new class {
    /**
     * Check if the hash of the file is correct
     * @param project {Project}
     * @returns {boolean}
     */
    check(project) {
        if (project.skipHashCheck) {
            return true;
        }

        if (project.lastHash == null) {
            return true;
        }

        return project.lastHash === this.#getHash(project.location.full);
    }

    /**
     * Update lastHash
     * @param project {Project}
     */
    update(project) {
        projectConfigFacade.update(project.id, (local) => {
            local.lastHash = this.#getHash(project.location.full);
        });
    }

    /**
     * Get hash based on file content
     * @param file {string}
     * @returns {string}
     */
    #getHash(file) {
        const text = fs.readFileSync(file, 'utf8');
        return hasher.hash(text);
    }
}