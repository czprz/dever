export class Args {
    /**
     * Option for starting environment
     * @type {boolean|string|string[]}
     */
    start;

    /**
     * Option for stopping environment
     * @type {boolean|string|string[]}
     */
    stop;

    /**
     * Starts one or more groups of executions
     * @type {boolean|string|string[]}
     */
    startGroup;

    /**
     * Stops one or more groups of executions
     * @type {boolean|string|string[]}
     */
    stopGroup;

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
     * @type {Args | null}
     */
    args;
}

export class Project {
    /**
     * @type {string}
     */
    name;

    /**
     * @type {string}
     */
    version;

    /**
     * @type {string[]}
     */
    keywords;

    /**
     * @type {Execution[]}
     */
    setup;

    /**
     * @type {Fix[]}
     */
    fix;

    /**
     * @type {Execution[]}
     */
    environment;
}

class Fix {
    /**
     * @type {string}
     */
    key;

    /**
     * Define which handler you're using ('powershell-command','powershell-script')
     * @type {string}
     */
    type;

    /**
     * Command which is going to be executed as part of fix. Used with ('powershell-command')
     * @type {string | null}
     */
    command;

    /**
     * File which is going to be executed as part of fix. Used with ('powershell-script')
     * @type {string | null}
     */
    file;
}

export class Execution extends ExecutionStep {
    /**
     * @type {string}
     */
    name;

    /**
     * @type {string | null}
     */
    group;

    /**
     * @type {boolean}
     */
    default = true;

    /**
     * @type {ExecutionStep | null}
     */
    up;

    /**
     * @type {ExecutionStep | null}
     */
    down;

    /**
     * @param config {ExecutionConfig}
     * @param runtime {Runtime}
     */
    constructor(config, runtime) {
        super();

        Execution.#mapToExecutionStep(this, config);

        if (config.start != null) {
            this.#migrate(config, runtime);
        }
    }

    /**
     *
     * @param config {ExecutionRunConfig}
     * @param runtime {Runtime}
     */
    #migrate(config, runtime) {
        const selected = runtime.up ? 'up' : 'down';

        if (runtime.up) {
            this.up = new ExecutionStep();
            Execution.#mapToExecutionStep(this.up, config.up);
        } else {
            this.down = new ExecutionStep();
            Execution.#mapToExecutionStep(this.down, config.down);
        }

        this.#updateStepValues(this[selected] ?? this.up);
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
     * Update the selected step
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

class ExecutionStep extends Executable {
    /**
     * Custom options that will be passed along to dependency
     * @type {Option[] | null}
     */
    options;

    /**
     * @type {Wait | null}
     */
    wait;

    /**
     * Informs whether a dependency needs to be run as elevated user
     * @type {boolean | null}
     */
    runAsElevated;

    /**
     * @type {Executable | null}
     */
    after;

    /**
     * @type {Executable | null}
     */
    before;
}

class Executable {
    /**
     * Define which handler you're using ('docker-container','powershell-command','powershell-script','docker-compose','mssql','chocolatey')
     * @type {string} @required
     */
    type;

    /**
     * filepath to the file to be executed only used when type is 'powershell-script'
     * @type {string | null}
     */
    file;

    /**
     * Command to be executed only when type is 'powershell-command'
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
     * Chocolatey object only used when type is 'chocolatey'
     * @type {string | null}
     */
    package;
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

class Option {
    /**
     * Check if dependency is allowed to execute without option
     * @type {boolean}
     */
    required;

    /**
     * Option key can be used in console
     * @type {string}
     */
    key;

    /**
     * Possibility for having an alias for the option
     * @Optional
     * @type {string}
     */
    alias;

    /**
     * Describe what this option will be used for
     * @type {string}
     */
    describe;

    /**
     * Replace specific area given in value area e.g. "$0" if e.g. command is "docker run $0 nginx"
     * @type {string}
     */
    insert;

    /**
     * Condition for which this option is allowed to receive a value
     * @type {OptionRule}
     */
    rule;
}

class OptionRule {
    /**
     * Check whether value being passed is as expected using regex match
     * @type {string}
     */
    match;

    /**
     * If condition check fails this message will be shown
     * @type {string}
     */
    message;
}

class DbQuery {
    /**
     * Username for SQL connection
     * @return {string}
     */
    username;

    /**
     * Password for SQL connection
     * @return {string}
     */
    password;

    /**
     * Used for selecting between ('create-database', 'create-table', 'insert')
     * @return {string}
     */
    option;

    /**
     * Database name necessary for DB Creation, Table Creation and Query execution
     * @return {string}
     */
    database;

    /**
     * Table necessary for Table Creation and Query Execution
     * @return {string}
     */
    table;

    /**
     * Data currently only necessary for ('insert')
     * @return {DbColumn[]}
     */
    columns;
}

class DbColumn {
    /**
     * Column name
     * @var {string}
     */
    key;

    /**
     * Column value type (Only required for creating table)
     * @var {string}
     */
    valueType;

    /**
     * Column value
     * @var {any=} null
     */
    value;
}

class Container {
    /**
     * Name
     * @var {string}
     */
    name;

    /**
     * Port mappings
     * @var {string[]}
     */
    ports;

    /**
     * Environment variables
     * @var {string[]}
     */
    variables;

    /**
     * Name of docker image
     * @var {string}
     */
    image;
}