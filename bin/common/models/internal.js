export class Project {
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
     * @return {ExecutionConfig[]}
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

class ExecutionConfig extends ExecutionRunConfig {
    /**
     * @type {string} @required
     */
    name;

    /**
     * @type {string | null} @optional
     */
    group;

    /**
     * @type {ExecutionRunConfig} @required
     */
    start;

    /**
     * @type {ExecutionRunConfig} @optional
     */
    stop;
}

class ExecutionRunConfig {
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