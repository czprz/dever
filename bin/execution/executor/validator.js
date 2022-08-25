import optionsMapper from "../../common/mappers/options-mapper.js";
import {Runtime} from "./runtime-mapper.js";
import {Executable} from "./action-mapper.js";

import chalk from "chalk";

export default new class {
    /**
     * Validate executions
     * @param executables {Executable[]}
     * @param runtime {Runtime}
     * @return { { status: boolean, message: string|null } }
     */
    validate(executables, runtime) {
        if (executables.length === 0) {
            return {status: false, message: chalk.redBright('No actions found matching your criteria')};
        }

        if (executables.some(x => x.name == null || x.type == null)) {
            return {status: false, message: chalk.redBright('Actions must have a name and type')};
        }

        const result = this.#checkOptions(runtime.args, executables);
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
        const options = optionsMapper.mapFromExecutable(executables);

        for (const optionKey in options) {
            const option = options[optionKey];
            const value = args[option.key];

            if (value == null && !option.required) {
                continue;
            }

            if (value == null && option.required) {
                return {status: false, message: `Missing option "${option.key}". It's required`};
            }

            if (option.rule == null) {
                continue;
            }

            const regex = RegExp(`${option.rule.match}`);
            if (!regex.test(value)) {
                return {status: false, message: option.rule.message};
            }
        }

        return {status: true, message: null};
    }
}