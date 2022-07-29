import {Execute, Runtime} from '../models/dever-json/internal.js';

export class Result {
    /**
     * @type {Status}
     */
    status;

    /**
     * @type {string}
     */
    operation;

    /**
     * @type {string}
     */
    type;

    /**
     * @type {exception | null}
     */
    error;

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

export class ExecutionInterface {
    /**
     * Execution type
     * @type {string|null}
     * @internal
     */
    _type = null;

    /**
     * @param execute {Execute}
     * @param runtime {Runtime}
     * @returns {Promise<Result> | Result}
     */
    handle(execute, runtime) {
        throw new Error('ExecutorInterface.handle() is not implemented');
    }

    /**
     * @return {Promise<Result> | Result}
     */
    check() {
        throw new Error('ExecutorInterface.check() is not implemented');
    }

    /**
     * Create success response
     * @param operation {string}
     * @return {Result}
     * @internal
     */
    _success(operation) {
        if (this._type == null) {
            throw new Error('ExecutorInterface._type is not set');
        }

        return new Result(Status.Success, operation, this._type);
    }

    /**
     * Create error response
     * @param operation {string}
     * @param error {exception | null}
     * @return {Result}
     * @internal
     */
    _error(operation, error = null) {
        if (this._type == null) {
            throw new Error('ExecutorInterface._type is not set');
        }

        return new Result(Status.Error, operation, this._type, error);
    }

    /**
     * Create warning response
     * @param operation {string}
     * @param error {exception | null}
     * @return {Result}
     * @internal
     */
    _warning(operation, error) {
        if (this._type == null) {
            throw new Error('ExecutorInterface._type is not set');
        }

        return new Result(Status.Warning, operation, this._type, error);
    }
}


export const Status = Object.freeze({'Success': 0, 'Error': 1, 'Warning': 2});