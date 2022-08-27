import optionsMapper from "../../mappers/options-mapper.js";

export default new class {
    /**
     * Create yargs options for actions
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
}