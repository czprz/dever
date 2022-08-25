import {Args} from "../../models/common.js";
import {Action, Option} from "../../models/dever-json/internal.js";
import optionsMapper from "../../mappers/options-mapper.js";

"use strict";
export default new class { // TODO: Move 'addToYargs' to it's own file.
    /**
     *
     * @param yargs {object}
     * @param actions {Action[]}
     * @return {object}
     */
    addToYargs(yargs, actions) {
        const demandedOptions = [];

        const options = optionsMapper.mapFromActions(actions)

        for (const option of options) {
            if (option.required) {
                demandedOptions.push(option.key);
            }

            yargs
                .option(option.key, {
                    alias: option.alias,
                    describe: option.describe,
                    default: option.default,
                });
        }

        yargs.demandOption(demandedOptions);

        return yargs;
    }

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
