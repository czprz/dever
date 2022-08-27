import {Action, Option} from "../models/dever-json/internal.js";


export default new class {
    /**
     * Maps actions to options
     * @param actions {Action[]}
     * @return {Option[]}
     */
    mapFromActions(actions) {
        const options = [];
        for (const action of actions) {
            if (action.options == null) {
                continue;
            }

            for (const option in action.options) {
                options.push(action.options[option]);
            }
        }

        return options;
    }

    /**
     * Map executables to options
     * @param executables {Executable[]}
     * @return {Option[]}
     */
    mapFromExecutable(executables) {
        const options = [];
        for (const executable of executables) {
            if (executable.options == null) {
                continue;
            }

            for (const option in executable.options) {
                options.push(executable.options[option]);
            }
        }

        return options;
    }
}