export const Step = Object.freeze({"Before": 0, "After": 1});

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

export class Project {
    /**
     * @type {number}
     */
    id;

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
     * @type {Executable[]}
     */
    install;

    /**
     * @type {Fix[]}
     */
    fix;

    /**
     * @type {Executable[]}
     */
    environment;

    /**
     * @type {Location}
     */
    location;

    /**
     * @type {string}
     */
    lastHash;

    /**
     * @type {boolean}
     */
    skipHashCheck;

    /**
     * @type {boolean}
     */
    supported;

    /**
     * @type {boolean}
     */
    validSchema;

    /**
     * @type {boolean}
     */
    validKeywords;

    /**
     * @type {InternalOptions}
     */
    internalOptions;
}

export class Fix {
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

export class Execute {
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

    /**
     * Informs whether a dependency needs to be run as elevated user
     * @type {boolean | null}
     */
    runAsElevated;

    /**
     * Custom options that will be passed along to dependency
     * @type {Option[] | null}
     */
    options;

    /**
     * @type {string}
     */
    location;
}

export class Action extends Execute {
    /**
     * @type {Wait | null}
     */
    wait;

    /**
     * @type {Execute | null}
     */
    after;

    /**
     * @type {Execute | null}
     */
    before;
}

export class Executable extends Action {
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
    optional;

    /**
     * @type {Action | null}
     */
    up;

    /**
     * @type {Action | null}
     */
    down;

    /**
     * @param config {Executable}
     * @param runtime {Runtime}
     */
    constructor(config, runtime) {
        super();

        this.name = config.name;

        Executable.#map(this, config);

        if (config.up != null) {
            this.#migrate(config, runtime);
        }
    }

    /**
     *
     * @param config {Executable}
     * @param runtime {Runtime}
     */
    #migrate(config, runtime) {
        const selected = runtime.up ? 'up' : 'down';

        if (runtime.up) {
            this.up = new Action();
            Executable.#map(this.up, config.up);
        } else {
            this.down = new Action();
            Executable.#map(this.down, config.down);
        }

        this.#updateStepValues(this[selected] ?? this.up);
    }

    /**
     * Set all selected step values
     * @param executionStep {Execute}
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
     * @param step {Action}
     * @param config {Executable}
     * @return void
     */
    static #map(step, config) {
        step.type = config.type;
        step.sql = config.sql;
        step.file = config.file;
        step.command = config.command;
        step.container = config.container;
        step.package = config.package;
        step.options = config.options;
        step.wait = config.wait;
        step.runAsElevated = config.runAsElevated;
        step.before = config.before;
        step.after = config.after;
    }
}

export class InternalOptions {
    /**
     * @type {string[]}
     */
    keywords;
}

export class Location {
    /**
     * @type {string} @required
     */
    full;

    /**
     * @type {string} @required
     */
    partial;
}

export class Wait {
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

export class Option {
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

export class OptionRule {
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

export class DbQuery {
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

export class DbColumn {
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

export class Container {
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