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
     * @return {string}
     */
    type;

    /**
     * @return {string}
     */
    name;

    /**
     * @return {boolean}
     */
    runtime;

    /**
     * @return {string}
     */
    file;

    /**
     * @return {string}
     */
    command;

    /**
     * Sql object only used when type is 'mssql'
     * @return {DbQuery | null}
     */
    sql;

    /**
     * Container object only used when type is 'docker-container'
     * @return {Container | null}
     */
    container;

    /**
     * Custom options that will be passed along to dependency
     * @return {CustomOption[] | null}
     */
    options;
    // Todo: Consider new name for this property

    /**
     * @return {Wait}
     */
    wait;

    /**
     * Informs whether a dependency needs to be run as elevated user
     * @return {boolean}
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
     * @var {string}
     */
    username;

    /**
     * Password for SQL connection
     * @var {string}
     */
    password;

    /**
     * Used for selecting between ('create-database', 'create-table', 'insert')
     * @var {string}
     */
    option;

    /**
     * Database name necessary for DB Creation, Table Creation and Query execution
     * @var {string}
     */
    database;

    /**
     * Table name necessary for Table Creation and Query Execution
     * @var {string}
     */
    table;

    /**
     * Data currently only necessary for ('insert')
     * @var {DbData[]}
     */
    data;
}

class DbData {
    /**
     * Column name
     */
    key;

    /**
     * Column value
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
