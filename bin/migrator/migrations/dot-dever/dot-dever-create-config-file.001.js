import {Config} from '../../../common/models/dot-dever/external.js';

export default new class {
    /**
     * Add migration version to config
     * @param config {Config}
     * @returns {Config}
     */
    migrate(config) {
        if (config != null && Object.keys(config).length > 0) {
            return config;
        }

        const patch = {
            projects: [],
            skipAllHashChecks: false,
            lastVersionCheckMs: 0,
            latestVersion: null,
        };

        return {
            ...config,
            ...patch
        }
    }
}