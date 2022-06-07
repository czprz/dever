import projectsConfig from "../../configuration/projects-config.js";
import crypto from 'crypto';
import fs from "fs";

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

        return project.lastHash === this.#getHash(project.location);
    }

    /**
     * Update lastHash
     * @param project {Project}
     */
    update(project) {
        projectsConfig.update(project, {
            lastHash: this.#getHash(project.location)
        });
    }

    /**
     * Get hash based on file content
     * @param file {string}
     * @returns {string}
     */
    #getHash(file) {
        const text = fs.readFileSync(file, 'utf8');
        return crypto.createHash('sha256').update(text).digest('hex');
    }
}