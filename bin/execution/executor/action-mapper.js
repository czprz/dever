import {Runtime} from "./runtime-mapper.js";
import {Action} from "../../common/models/dever-json/internal.js";

export default new class {
    /**
     * Maps environment to ensure usage of proper start or stop values
     * @param actions {Action[]}
     * @param location {Location}
     * @param runtime {Runtime}
     * @returns {Executable[]}
     */
    map(actions, location, runtime) {
        const executables = actions.filter(action => this.#filtering(action, runtime))
            .map(action => this.#mapToExecutable(action, location, runtime));

        if (runtime.down) {
            return executables.reverse();
        }

        return executables;
    }

    /**
     * Removes actions that should not be included depending on runtime
     * @param action {Action}
     * @param runtime {Runtime}
     * @return {boolean}
     */
    #filtering(action, runtime) {
        const lowerCaseName = action?.name?.toLowerCase();

        const notIncluded = runtime.include.executions.length > 0 && !runtime.include.executions.some(x => x.toLowerCase() === lowerCaseName);
        const notIncludedGroup = runtime.include.groups.length > 0 && !runtime.include.groups.some(x => this.#hasGroup(action, x));

        if (notIncluded || notIncludedGroup) {
            return false;
        }

        if (!notIncluded && !notIncludedGroup && action.optional && runtime.args?.name !== lowerCaseName) {
            return false;
        }

        if (!this.#hasUp(action) && runtime.up ||
            !this.#hasDown(action) && runtime.down) {
            return false;
        }

        return !(runtime.exclude.executions.length > 0 && runtime.exclude.executions.some(x => x.toLowerCase() === lowerCaseName) ||
            runtime.exclude.groups.length > 0 && runtime.exclude.groups.some(x => this.#hasGroup(action, x)));
    }

    /**
     * Maps action to executable
     * @param action {Action}
     * @param location {Location}
     * @param runtime {Runtime}
     * @return {Executable}
     */
    #mapToExecutable(action, location, runtime) {
        return {
            name: action.name,
            group: action.group,
            optional: action.optional ?? false,
            runOnce: action.runOnce ?? false,
            hasRun: action.hasRun ?? false,
            lastHash: action.lastHash ?? null,
            location: location.partial,
            elevated: this.#getValue(action, 'runAsElevated', runtime) ?? false,
            type: this.#getValue(action, 'type', runtime),
            sql: this.#getValue(action, 'sql', runtime),
            file: this.#getValue(action, 'file', runtime),
            command: this.#getValue(action, 'command', runtime),
            container: this.#getValue(action, 'container', runtime),
            package: this.#getValue(action, 'package', runtime),
            options: this.#getValue(action, 'options', runtime),
            wait: this.#getWait(action, runtime),
            before: this.#getValue(action, 'before', runtime),
            after: this.#getValue(action, 'after', runtime),
        }
    }

    /**
     * Maps dever.json wait to executable wait
     * @param action
     * @param runtime
     * @return {Wait}
     */
    #getWait(action, runtime) {
        const wait = this.#getValue(action, 'wait', runtime);
        if (wait == null) {
            return null;
        }

        return {
            when: wait.when,
            seconds: wait.time
        };
    }

    /**
     * Gets value depending on runtime
     * @param action {Action}
     * @param key {string}
     * @param runtime {Runtime}
     * @return {*}
     */
    #getValue(action, key, runtime) {
        if (action.up != null && runtime.up) {
            return action.up[key];
        }

        if (action.up != null && action.down == null && runtime.down) {
            return action.up[key];
        }

        if (action.down != null && runtime.down) {
            return action.down[key];
        }

        return action[key];
    }

    /**
     * Checks if action has any up executions
     * @param action {Action}
     * @return {boolean}
     */
    #hasUp(action) {
        return action.up != null ||
            this.#hasAnyGenerics(action);
    }

    /**
     * Check if action has any down executions
     * @param action {Action}
     * @return {boolean}
     */
    #hasDown(action) {
        return action.down != null ||
            this.#hasAnyGenerics(action);
    }

    /**
     * Checks for any generic executions
     * @param action {Action}
     */
    #hasAnyGenerics(action) {
        return action.container != null ||
            action.file != null ||
            action.command != null ||
            action.package != null ||
            action.sql != null;
    }

    /**
     * Checks if action has a matching group
     * @param action {Action}
     * @param groupName {string}
     * @return {boolean}
     */
    #hasGroup(action, groupName) {
        return action.group.some(a => a.toLowerCase() === groupName.toLowerCase());
    }
}

export class Execute {
    /**
     * @type {string}
     */
    type;

    /**
     * @type {string}
     */
    location;

    /**
     * @type {boolean}
     */
    elevated;

    /**
     * @type {DbQuery | null}
     */
    sql;

    /**
     * @type {string | null}
     */
    file;

    /**
     * @type {string | null}
     */
    command;

    /**
     * @type {Container | null}
     */
    container;

    /**
     * @type {string | null}
     */
    package;

    /**
     * @type {Option | null}
     */
    options;
}

export class Executable extends Execute {
    /**
     * @type {string}
     */
    name;

    /**
     * @type {Array<string>}
     */
    group;

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
    hasRun;

    /**
     * @type {string | null}
     */
    lastHash;

    /**
     * @type {Wait}
     */
    wait;

    /**
     * @type {Execute}
     */
    before;

    /**
     * @type {Execute}
     */
    after;
}

/** WAIT **/

export class Wait {
    /**
     * Choose when wait should occur ('before','after')
     * @type {string}
     */
    when;

    /**
     * Choose how long to wait (in seconds)
     * @type {number}
     */
    seconds;
}

/** DOCKER */

export class Container {
    /**
     * @type {string}
     */
    name;

    /**
     * Name of docker image
     * @type {string}
     */
    image;

    /**
     * Ports mappings
     * @type {string[]}
     */
    ports;

    /**
     * Environment variables
     * @type {string[]}
     */
    variables;
}

/** SQL **/

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

/** Options **/

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
