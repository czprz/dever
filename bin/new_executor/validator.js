import chalk from "chalk";

export default new class {
    /**
     * Validate executions
     * @param executions {Executable[]}
     * @param runtime {Runtime}
     * @return { { status: boolean, message: string|null } }
     */
    validate(executions, runtime) {
        if (executions.length === 0) {
            return {status: false, message: chalk.redBright('No actions found matching your criteria')};
        }

        if (executions.some(x => x.name == null || x.type == null)) {
            return {status: false, message: chalk.redBright('Actions must have a name and type')};
        }

        const result = this.#checkOptions(runtime.args, executions);
        if (!result.status) {
            return result;
        }

        return {status: true, message: null};
    }

    /**
     * Validate arguments against options rules
     * @param args {Args}
     * @param executables {Executable[]}
     * @return { { status: boolean, message: string|null } }
     */
    #checkOptions(args, executables) {
        const options = this.#getOptions(executables);

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
     * Get all custom options from executions
     * @param executions {Action[]}
     * @return {Option[]}
     */
    #getOptions(executions) {
        // Todo: duplicate in custom-options-creator.js
        const options = [];
        for (const execution of executions) {
            if (execution.options == null) {
                continue;
            }

            for (const option in execution.options) {
                options.push(execution.options[option]);
            }
        }

        return options;
    }
}