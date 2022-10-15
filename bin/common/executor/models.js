import {Runtime} from "../../execution/executor/runtime-mapper.js";
import {Execute} from "../../execution/executor/action-mapper.js";
import {Subject} from "rxjs";
import logger from "../helper/logger.js";
import chalk from "chalk";

export class Informer {
    /**
     * Outputs response to the console
     * @param type {'warning', 'error', 'success'}
     * @param message {string}
     * @param error {Error | null}
     * @internal
     */
    _inform(type, message, error = null) {
        switch (type) {
            case 'success':
                logger.info(message);
                break;
            case 'error':
                logger.error(message, error);
                break;
            case 'warning':
                logger.warn(message);
                break;
            default:
                throw new Error(`Unknown response type: ${type}`);
        }
    }

    _inform_partial(message, end = false, error = false) {
        process.stdout.write(error ? chalk.redBright(message) : message);

        if (end) {
            process.stdout.write('\r\n');
        }
    }
}

export class ExecutionLog {
    /**
     * @param status {Status}
     * @param operation {string}
     * @param type {string}
     * @param error {exception | null}
     */
    constructor(status, operation, type, error = null) {
        this.status = status;
        this.operation = operation;
        this.type = type;
        this.error = error;
    }
}

export const State = Object.freeze({
    Started: 'started',
    Progressing: 'progressing',
    Finished: 'finished',
});

export class ExecutionInterface {
    /**
     * Execution type
     * @type {string|null}
     * @internal
     */
    _type = null;

    /**
     * Execution log
     * @type {Subject<ExecutionLog>}
     * @internal
     */
    #logger = new Subject();

    /**
     * @param execute {Execute}
     * @param runtime {Runtime}
     */
    async handle(execute, runtime) {
        await this._execute(execute, runtime);
    }

    /**
     * @return {Promise<ExecutionLog> | ExecutionLog}
     */
    check() {
        throw new Error('ExecutorInterface.check() is not implemented');
    }

    /**
     * Get execution logs
     * @return {Subject<ExecutionLog>}
     */
    getLogger() {
        return this.#logger;
    }

    /**
     * Execute command
     * @param execute {Execute}
     * @param runtime {Runtime}
     * @private
     */
    async _execute(execute, runtime) {
        throw new Error('ExecutorInterface._execute() is not implemented');
    }

    /**
     * Create started response
     * @param operation {string}
     * @returns {ExecutionLog}
     * @internal
     */
    _started(operation) {
        if (this._type == null) {
            throw new Error('ExecutorInterface._type is not set');
        }

        return this.#log(new ExecutionLog(Status.Started, operation, this._type));
    }

    /**
     * Create progress response
     * @param operation {string}
     * @returns {ExecutionLog}
     * @internal
     */
    _progress(operation) {
        if (this._type == null) {
            throw new Error('ExecutorInterface._type is not set');
        }

        return this.#log(new ExecutionLog(Status.Progress, operation, this._type));
    }

    /**
     * Create success response
     * @param operation {string}
     * @param disable_log {boolean}
     * @return {ExecutionLog}
     * @internal
     */
    _success(operation, disable_log = false) {
        if (this._type == null) {
            throw new Error('ExecutorInterface._type is not set');
        }

        return this.#log(new ExecutionLog(Status.Success, operation, this._type), disable_log);
    }

    /**
     * Create error response
     * @param operation {string}
     * @param error {exception | null}
     * @param disable_log {boolean}
     * @return {ExecutionLog}
     * @internal
     */
    _error(operation, error = null, disable_log = false) {
        if (this._type == null) {
            throw new Error('ExecutorInterface._type is not set');
        }

        return this.#log(new ExecutionLog(Status.Error, operation, this._type, error), disable_log);
    }

    /**
     * Create warning response
     * @param operation {string}
     * @param error {exception | null}
     * @return {ExecutionLog}
     * @internal
     */
    _warning(operation, error) {
        if (this._type == null) {
            throw new Error('ExecutorInterface._type is not set');
        }

        return this.#log(new ExecutionLog(Status.Warning, operation, this._type, error));
    }

    /**
     * Log state
     * @param log {ExecutionLog}
     * @param disable_log {boolean}
     * @return ExecutionLog
     * @private
     */
    #log(log, disable_log = false) {
        if (!disable_log && this.#logger instanceof Subject) {
            this.#logger.next(log);
        }

        return log;
    }
}


export const Status = Object.freeze({'Success': 0, 'Error': 1, 'Warning': 2, 'Started': 3, 'Progress': 4});