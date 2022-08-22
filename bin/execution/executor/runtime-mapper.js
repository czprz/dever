export default new class {
    /**
     * Creates runtime object from args
     * @param args {Args}
     * @returns {Runtime}
     */
    getRuntime(args) {
        const up = this.#hasValue(args, 'up');
        const down = this.#hasValue(args, 'down');
        const upGroup = this.#hasValue(args, 'up-group');
        const downGroup = this.#hasValue(args, 'down-group');

        if (up === down || downGroup === upGroup) {
            return {
                up: up || upGroup,
                down: down || downGroup
            };
        }

        return {
            up: up || upGroup,
            down: down || downGroup,
            include: {
                executions: this.#getVariables(args['name']),
                groups: this.#getVariables(args[`name`])
            },
            exclude: {
                executions: this.#getVariables(args.not),
                groups: this.#getVariables(args.notGroup)
            },
            clean: args.hasOwnProperty('clean'),
            args: args
        };
    }

    /**
     * Properly format keys regardless of input
     * @param value {string|string[]}
     * @return {string[]}
     */
    #getVariables(value) {
        if (typeof value === 'string') {
            return value.split(',');
        }

        return value != null && typeof value !== 'boolean' ? value : [];
    }

    #hasValue(args, key) {
        return args._ != null && args._.length > 0 && args._.includes(key);
    }
}

export class Runtime {
    /**
     * Start option is true when set
     * @type {boolean}
     */
    up;

    /**
     * Stop option is true when set
     * @type {boolean}
     */
    down;

    /**
     * List of groups and executions to be included in starting or stopping
     * @type { { executions: string[], groups: string[] } | null }
     */
    include;

    /**
     * List of groups and executions to be excluded when starting and stopping
     * @type { { executions: string[], groups: string[] } | null }
     */
    exclude;

    /**
     * Is checked if user wants a clean start
     * @type {boolean | null}
     */
    clean;

    /**
     * @type {any | null}
     */
    args;
}