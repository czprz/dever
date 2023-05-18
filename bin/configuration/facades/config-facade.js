import localConfig from "../local-config.js";
import {Config} from '../../common/models/dot-dever/external.js';

export default new class {
    /**
     * @callback updateRequest
     * @param {Config} config
     */

    /**
     * @param fn {updateRequest}
     */
    update(fn) {
        const config = localConfig.get();

        fn(config);

        localConfig.write(config);
    }

    /**
     * @callback request
     * @param {Config} config
     */

    /**
     * @param fn {request}
     * @return {any}
     */
    getSingle(fn) {
        const config = localConfig.get();

        return fn(config);
    }

    /**
     * Get .dever config
     * @return {Config}
     */
    get() {
        return localConfig.get();
    }

    /**
     * Get .dever file location
     * @return {string}
     */
    getLocation() {
        return localConfig.getFilePath();
    }
}