import fs from "fs";
import path from "path";

export default new class {
    #searchDirs = ['/home', '/opt', '/var', '/usr/local'];

    /**
     * Gets all dever.json paths on linux
     * @returns {Promise<string[]>} paths
     */
    async scan() {
        // TODO: Needs testing
        const paths = [];

        for (const dir of this.#searchDirs) {
            const foundPaths = this.#findReposAndJsonFiles(dir);
            paths.push(...foundPaths);
        }

        return paths;
    }

    /**
     * Finds folder to scan
     * @param dir {string}
     * @returns {string[]}
     */
    #findReposAndJsonFiles(dir) {
        const items = fs.readdirSync(dir);

        // TODO: Does it have to be a git repository folder?
        if (items.includes('.git')) {
            const gitDir = path.join(dir, '.git');
            return this.#searchForJsonFiles(gitDir);
        }

        const paths = [];

        for (const item of items) {
            const itemPath = path.join(dir, item);
            if (fs.statSync(itemPath).isDirectory()) {
                if (item === 'node_modules' || item === '.git' || item === '.svn' || item === '.hg' || item === 'bower_components') {
                    continue;
                }

                const foundPaths = this.#findReposAndJsonFiles(itemPath);
                paths.push(...foundPaths);
            }
        }

        return paths;
    }

    /**
     * Searches for dever.json files
     * @param dir {string}
     * @returns {string[]}
     */
    #searchForJsonFiles(dir) {
        const jsonFiles = [];
        const items = fs.readdirSync(dir);

        for (const item of items) {
            const itemPath = path.join(dir, item);
            const stats = fs.statSync(itemPath);

            if (stats.isFile() && path.extname(item) === 'dever.json') {
                jsonFiles.push(itemPath);
            }
        }

        return jsonFiles;
    }
}