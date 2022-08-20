export default new class {
    /**
     * Creates runtime object from args
     * @param args {Args}
     * @returns {Runtime}
     */
    getRuntime(args) {
        const up = args.hasOwnProperty('up');
        const down = args.hasOwnProperty('down');
        const upGroup = args.hasOwnProperty('up-group');
        const downGroup = args.hasOwnProperty('down-group');

        if (up === down || downGroup === upGroup) {
            return {
                up: up || upGroup,
                down: down || downGroup
            };
        }

        const choice = down || upGroup ? 'up' : 'down';

        return {
            up: up || upGroup,
            down: down || downGroup,
            include: {
                executions: this.#getVariables(args[choice]),
                groups: this.#getVariables(args[`${choice}-group`])
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
        if (typeof value === 'boolean') {
            return [];
        }

        if (typeof value === 'string') {
            return value.split(',');
        }

        return value != null ? value : [];
    }
}