import {Config} from '../../../common/models/dot-dever/external.js';

export default new class {
    /**
     * Add migration version to config
     * @param config {Config}
     * @returns {Config}
     */
    migrate(config) {
        if (config.migrationVersion != null && config.migrationVersion > 0) {
            return config;
        }

        const patch = {
            migrationVersion: 0
        };

        return {
            ...config,
            ...patch
        }
    }
}