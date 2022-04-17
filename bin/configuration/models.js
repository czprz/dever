class LocalConfig {
    /**
     * @return {Config[]}
     */
    components;
}

class Config {
    /**
     * @return {string}
     */
    version;

    /**
     * @return {string}
     */
    name;

    /**
     * @return {string[]}
     */
    keywords;

    /**
     * @return {Fix[]}
     */
    fix;

    /**
     * @return {Execution[]}
     */
    environment;

    /**
     * @return {Install[]}
     */
    install;

    /**
     * @return {string}
     */
    location;
}

class Execution {
    /**
     * Define which handler you're using ('docker-container','powershell-command','powershell-script','docker-compose','mssql')
     * @type {string}
     */
    type;

    /**
     * @type {string}
     */
    name;

    /**
     * @type {string | null}
     */
    group;

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

class Step {
    /**
     * Define which type of execution you want to run before or after ('powershell-command')
     * @return {string}
     */
    type;

    /**
     * Define powershell-command you want to execute
     * @return {string}
     */
    command;
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

class Fix {
    /**
     * Keyword for fix command
     * @return {string}
     */
    key;

    /**
     * Define which handler you're using ('powershell-command','powershell-script')
     * @return {string}
     */
    type;

    /**
     * Command which is gonna be executed as part of fix. Used with ('powershell-command')
     * @return {string}
     */
    command;

    /**
     * File which is gonna be executed as part of fix. Used with ('powershell-script')
     * @return {string}
     */
    file;
}

class Install {
    /**
     * Which type of install is defined. Currently only supports ('chocolately')
     * @return {string}
     */
    type;

    /**
     * Name of chocolatey package
     * @return {string}
     */
    package;

    /**
     * Name of group package belongs to
     * @return {string}
     */
    group;

    /**
     * Define functionality you would like to run after installation
     * @return {Step}
     */
    after;

    /**
     * Define functionality you would like to run after installation
     * @return {Step}
     */
    before;
}
