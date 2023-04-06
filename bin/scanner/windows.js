import fs from "fs";
import path from "path";
import {execSync} from "child_process";

export default new class {
    /**
     * Gets all dever.json paths on windows
     * @returns {Promise<string[]>} paths
     */
    async scan() {
        const paths = [];
        const disks = this.#getDisks();

        for (const disk of disks) {
            const files = this.#findFilesByName(disk, 'dever.json');
            paths.push(...files);
        }

        return paths;
    }

    /**
     * Check if the folder should be skipped
     * @param folderName {string}
     * @returns {boolean}
     */
    #isSkipFolder(folderName) {
        return ['Windows', 'Program Files', 'Program Files (x86)', 'ProgramData', 'AppData', 'node_modules'].includes(folderName);
    }

    /**
     * Find all files with the given name
     * @param rootPath {string}
     * @param filename {string}
     * @param files {string[]}
     * @returns {string[]}
     */
    #findFilesByName(rootPath, filename, files = []) {
        try {
            if (fs.existsSync(rootPath)) {
                const contents = fs.readdirSync(rootPath);

                for (const file of contents) {
                    const filePath = path.join(rootPath, file);

                    try {
                        const fileStat = fs.statSync(filePath);

                        if (fileStat.isDirectory()) {
                            if (!this.#isSkipFolder(file)) {
                                this.#findFilesByName(filePath, filename, files);
                            }
                        } else if (file === filename) {
                            files.push(filePath);
                        }
                    } catch (err) {
                        if (err.code !== 'EPERM' && err.code !== 'EBUSY' && err.code !== 'EACCES' && err.code !== 'ENOENT') {
                            throw err;
                        }
                    }
                }
            }
        } catch (err) {
            if (err.code !== 'EPERM' && err.code !== 'EACCES' && err.code !== 'ENOENT') {
                throw err;
            }
        }

        return files;
    }

    /**
     * Get all local disks volume names
     * @returns {Array<string>}
     */
    #getDisks() {
        const disks = [];

        const output = execSync('wmic logicaldisk get deviceid, volumename, description, mediatype').toString();
        const lines = output.trim().split('\r\n').slice(1);

        for (const line of lines) {
            const [_, volumeName, mediaType] = line.trim().split(/\s{2,}/);

            if (mediaType === '12') {
                disks.push(volumeName + '\\');
            }
        }

        return disks;
    }
}