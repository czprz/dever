module.exports = new class {
    /**
     *
     * @param yargs {object}
     * @param options {CustomOption[]}
     * @return {object}
     */
    addOptionsToYargs(yargs, options) {
        const demandedOptions = [];

        for (const option of options) {
            if (option.required) {
                demandedOptions.push(option.key);
            }

            yargs
                .option(option.key, {
                    alias: option.alias,
                    describe: option.describe
                });
        }

        yargs.demandOption(demandedOptions);

        return yargs;
    }

    /**
     * Validate arguments against options rules
     * @param args {Args}
     * @param options {CustomOption[]}
     * @return { { status: boolean, message: string|null } }
     */
    validateOptions(args, options) {
        for (const optionKey in options) {
            const option = options[optionKey];
            const value = args[option.key];

            if (value == null && !option.required) {
                continue;
            }

            if (value == null && option.required) {
                return {status: false, message: `Missing option "${option.key}". It's required`};
            }

            const regex = RegExp(`${option.rule.match}`);
            if (!regex.test(value)) {
                return {status: false, message: option.rule.message};
            }
        }

        return {status: true, message: null};
    }

    /**
     * @param command {string} Command that is going to receive additional options
     * @param options {CustomOption[]}
     * @param args {Args}
     * @return {string}
     */
    addOptionsToCommand(command, options, args) {
        if (options.length === 0) {
            return command;
        }

        let modifiedCommand = command;

        for (const option of options) {
            const replaceWith = this.#replaceWith(option.key, option.insert, args);
            modifiedCommand.replace(`$${option.key}`, replaceWith);
        }

        return modifiedCommand;
    }

    /**
     * Create value which will replace ref in command
     * @param key {string}
     * @param insert {string}
     * @param args {Args}
     * @return {string}
     */
    #replaceWith(key, insert, args) {
        const replaceWith = args[key] == null ? '' : args[key];
        return insert.replace('$value', replaceWith);
    }
}