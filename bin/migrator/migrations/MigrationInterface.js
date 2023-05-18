import {Config} from "../../common/models/dot-dever/external.js";

export class MigrationInterface {
    /**
     * Migrate
     * @param project {Project}
     * @param config {Config}
     * @returns object
     */
    migrate(project, config) {
        if (project == null) {
            throw new Error("Project is null");
        }

        if (config == null) {
            throw new Error("Config is null");
        }

        return this._migrate(project, config);
    }

    /**
     * Migrate
     * @param project {Project}
     * @param config {Config}
     * @returns object
     * @private
     */
    _migrate(project, config) {
        throw new Error('MigrationInterface._migrate() is not implemented');
    }
}