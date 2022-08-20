export default new class {
    /**
     * Maps environment to ensure usage of proper start or stop values
     * @param actions {Action[]}
     * @param runtime {Runtime}
     * @returns {Executable[]}
     */
    map(actions, runtime) {
        const executables = actions.filter(action => this.#filtering(action, runtime))
            .map(action => new Executable(action, runtime));

        if (runtime.down) {
            return executables.reverse();
        }

        return executables;
    }

    /**
     * Removes actions that should not be included depending on runtime
     * @param action {Action}
     * @param runtime {Runtime}
     * @return {boolean}
     */
    #filtering(action, runtime) {
        const lowerCaseName = action?.name?.toLowerCase();
        const lowerCaseGroup = action?.group?.toLowerCase();

        const notIncluded = runtime.include.executions.length > 0 && !runtime.include.executions.some(x => x.toLowerCase() === lowerCaseName);
        const notIncludedGroup = runtime.include.groups.length > 0 && !runtime.include.groups.some(x => x.toLowerCase() === lowerCaseGroup);

        if (notIncluded || notIncludedGroup) {
            return false;
        }

        if (!notIncluded && !notIncludedGroup && action.optional) {
            return false;
        }

        if (runtime.exclude.executions.length > 0 && runtime.exclude.executions.some(x => x.toLowerCase() === lowerCaseName) ||
            runtime.exclude.groups.length > 0 && runtime.exclude.groups.some(x => x.toLowerCase() === lowerCaseGroup)) {
            return false;
        }
    }
}

export class Executable {
    constructor(action, runtime) {
        this.action = action;
        this.runtime = runtime;
    }
}