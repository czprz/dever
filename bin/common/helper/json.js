import fs from "fs";
import chalk from "chalk";

export default new class {
    /**
     * Reads json file and converts it to an object
     * @param file {string}
     * @returns {unknown|null}
     */
    read(file) {
        try {
            const rawData = fs.readFileSync(file, {encoding: 'utf8'});
            return this.#decode(rawData);
        } catch (e) {
            switch (e.code) {
                case "ENOENT":
                    return null;
                default:
                    console.error(chalk.redBright(`Could not parse '${file}' due to json formatting.`));
                // Todo: Add exception to log file
            }
        }
    }

    /**
     * Writes object to file with json formatting
     * @param file {string}
     * @param data {object}
     */
    write(file, data) {
        fs.writeFileSync(file, this.#encode(data));
    }

    /**
     * Decodes json to object
     * @param {string} json
     * @returns {object}
     */
    #decode(json) {
        try {
            this.json = JSON.parse(json);
        } catch (e) {
            this.json = {};
        }

        return this.json;
    }

    /**
     * Encodes object to json
     * @param {object} json
     * @returns {string}
     */
    #encode(json) {
        return JSON.stringify(json);
    }
}