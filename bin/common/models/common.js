export class Args {
    /**
     * Option for starting environment
     * @type {boolean|string|string[]}
     */
    up;

    /**
     * Option for stopping environment
     * @type {boolean|string|string[]}
     */
    down;

    /**
     * Starts one or more groups of executions
     * @type {boolean|string|string[]}
     */
    upGroup;

    /**
     * Stops one or more groups of executions
     * @type {boolean|string|string[]}
     */
    downGroup;

    /**
     * Option (optional) included with start for starting environment cleanly
     * @type {boolean}
     */
    clean;

    /**
     * List of execution names which should not be included in starting or stopping
     * @type {boolean|string|string[]}
     */
    not;

    /**
     * List of group names which should not be included in starting or stopping
     * @type {boolean|string|string[]}
     */
    notGroup;

    /**
     * Component
     * @type {string}
     */
    keyword;

    /**
     * Skip warnings (typically used together with --start, if e.g. something needs to be elevated but you actually don't need it)
     * @type {boolean}
     */
    skip;

    /**
     * Skip hash check
     * @type {boolean}
     */
    skipHashCheck;
}