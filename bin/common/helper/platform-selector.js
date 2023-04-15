import os from "os";

export default new class {
    /**
     * Get the platform specific command
     * @param {Platforms} platforms
     * @returns {string}
     */
    get(platforms) {
        switch (os.platform()) {
            case 'win32':
                return platforms.windows;
            case 'darwin':
                return platforms.darwin;
            case 'linux':
                return platforms.linux;
            default:
                throw new Error(`Unsupported platform: ${os.platform()}`);
        }
    }
}

export class Platforms {
    /**
     * @type {string} windows
     */
    windows;

    /**
     * @type {string} darwin
     */
    darwin;

    /**
     * @type {string} linux
     */
    linux;
}