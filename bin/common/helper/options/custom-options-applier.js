import {Args} from "../../models/common.js";
import {Option} from "../../models/dever-json/internal.js";

"use strict";
export default new class {
    /**
     * @param command {string} Command that is going to receive additional options
     * @param options {Option[]}
     * @param args {Args}
     * @return {string}
     */
    addToCommand(command, options, args) {
        if (options == null || options.length === 0) {
            return command;
        }

        let modifiedCommand = command;

        for (const option of options) {
            const replaceWith = this.#replaceWith(option.key, option.param, args);
            modifiedCommand = `${modifiedCommand} ${replaceWith}`;
        }

        return modifiedCommand;
    }

    /**
     * @param file {string} File path
     * @param options {Option[]}
     * @param args {Args}
     * @return {string}
     */
    addToFile(file, options, args) {
        if (options == null || options.length === 0) {
            return file;
        }

        let fileModified = file;

        for (const option of options) {
            const customOption = this.#replaceWith(option.key, option.param, args);
            fileModified = `${fileModified} ${customOption}`;
        }

        return fileModified;
    }

    /**
     * Create value which will replace ref in command
     * @param key {string}
     * @param param {string}
     * @param args {Args}
     * @return {string}
     */
    #replaceWith(key, param, args) {
        const replaceWith = args[key] == null ? '' : args[key];
        return param.replace('$0', replaceWith);
    }
}
