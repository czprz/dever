export class Project {
    /**
     * @type {number}
     */
    version;

    /**
     * @type {string}
     */
    name;

    /**
     * @type {string[]}
     */
    keywords;

    /**
     * @type {Segment[]}
     */
    segments;
}

export class Segment {
    /**
     * @type {string}
     */
    key;

    /**
     * @type {string}
     */
    name;

    /**
     * @type {string}
     */
    description;

    /**
     * @type {Properties}
     */
    properties;

    /**
     * @type {Action[]}
     */
    actions;
}

export class Properties {
    /**
     * @type {boolean}
     */
    elevated;

    /**
     * @type {boolean}
     */
    name_required;
}

export class Execution {
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
     * Only run execution when specified
     * @type {boolean}
     */
    optional;

    /**
     * Only run execution once
     * @type {boolean}
     */
    runOnce;

    /**
     * Run execution as elevated
     * @type {boolean | null}
     */
    elevated;

    /**
     * Custom options that will be passed along to dependency
     * @type {Option[] | null}
     */
    options;
}

export class Step extends Execution {
    /**
     * @type {Wait | null}
     */
    wait;

    /**
     * @type {Execution | null}
     */
    after;

    /**
     * @type {Execution | null}
     */
    before;
}

export class Action extends Step {
    /**
     * @type {string}
     */
    name;

    /**
     * @type {boolean}
     */
    optional;

    /**
     * @type {boolean}
     */
    runOnce;

    /**
     * @type {boolean}
     */
    elevated;

    /**
     * @type {boolean}
     */
    hasRun;

    /**
     * @type {string}
     */
    lastHash;

    /**
     * @type {string | Array<string> | null}
     */
    group;

    /**
     * @type {Step | null}
     */
    up;

    /**
     * @type {Step | null}
     */
    down;
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
    param;

    /**
     * Condition for which this option is allowed to receive a value
     * @type {OptionRule}
     */
    rule;

    /**
     * Specify a default value for this option
     * @type {string|number|boolean|null}
     */
    default;
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
