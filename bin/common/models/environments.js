class Runtime {
    /**
     * Start option is true when set
     * @type {boolean}
     */
    start;

    /**
     * Stop option is true when set
     * @type {boolean}
     */
    stop;

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
     * @type {EnvArgs | null}
     */
    args;
}

class ExecutionStep {
    /**
     * Define which handler you're using ('docker-container','powershell-command','powershell-script','docker-compose','mssql')
     * @type {string} @required
     */
    type;

    /**
     * @type {string | null}
     */
    file;

    /**
     * @type {string | null}
     */
    command;

    /**
     * Sql object only used when type is 'mssql'
     * @type {DbQuery | null}
     */
    sql;

    /**
     * Container object only used when type is 'docker-container'
     * @type {Container | null}
     */
    container;

    /**
     * Custom options that will be passed along to dependency
     * @type {CustomOption[] | null}
     */
    options;
    // Todo: Consider new name for this property

    /**
     * @type {Wait | null}
     */
    wait;

    /**
     * Informs whether a dependency needs to be run as elevated user
     * @type {boolean | null}
     */
    runAsElevated;
}

export class Execution extends ExecutionStep {
    /**
     * @type {string} @required
     */
    name;

    /**
     * @type {string | null} @optional
     */
    group;

    /**
     * Indicate whether mapping of start or stop was successful
     * @type {boolean} @required
     */
    hasStop;

    /**
     * @type {ExecutionStep | null}
     */
    start;

    /**
     * @type {ExecutionStep | null}
     */
    stop;

    /**
     * @type {'start' | 'stop'} @required
     */
    #selectedStep;

    /**
     * @param config {ExecutionConfig}
     * @param runtime {Runtime}
     */
    constructor(config, runtime) {
        super();

        this.#selectedStep = runtime.start ? 'start' : 'stop';

        this.name = config.name;
        this.hasStop = !!config.stop;
        this.group = config.group;

        if (config.start == null) {
            Execution.#mapToExecutionStep(this, config);
            return;
        }

        this.start = new ExecutionStep();
        Execution.#mapToExecutionStep(this.start, config.start);

        if (this.hasStop) {
            this.stop = new ExecutionStep();
            Execution.#mapToExecutionStep(this.stop, config.stop);
        }

        this.#updateStepValues(this[this.#selectedStep] ?? this.start);
    }

    /**
     * Set all selected step values
     * @param executionStep {ExecutionStep}
     * @return void
     */
    #updateStepValues(executionStep) {
        for (const property in executionStep) {
            if (this.hasOwnProperty(property)) {
                this[property] = executionStep[property];
            }
        }
    }

    /**
     * @param step {ExecutionStep}
     * @param config {ExecutionRunConfig}
     * @return void
     */
    static #mapToExecutionStep(step, config) {
        step.type = config.type;
        step.sql = config.sql;
        step.file = config.file;
        step.command = config.command;
        step.container = config.container;
        step.options = config.options;
        step.wait = config.wait;
        step.runAsElevated = config.runAsElevated;
    }
}

class Wait {
    /**
     * Choose when wait should occur ('before', 'after')
     * @return {string}
     */
    when;

    /**
     * Choose for how long it should wait
     * @return {number}
     */
    time; // in milliseconds
}

class CustomOption {
    /**
     * Check if dependency is allowed to execute without option
     * @return {boolean}
     */
    required;

    /**
     * Option key can be used in console
     * @return {string}
     */
    key;

    /**
     * Possibility for having an alias for the option
     * @Optional
     * @return {string}
     */
    alias;

    /**
     * Describe what this option will be used for
     * @return {string}
     */
    describe;

    /**
     * Replace specific area given in value area e.g. "$0" if e.g. command is "docker run $0 nginx"
     * @return {string}
     */
    insert;

    /**
     * Condition for which this option is allowed to receive a value
     * @return {CustomOptionRule}
     */
    rule;
}

class CustomOptionRule {
    /**
     * Check whether value being passed is as expected using regex match
     * @return {string}
     */
    match;

    /**
     * If condition check fails this message will be shown
     * @return {string}
     */
    message;
}