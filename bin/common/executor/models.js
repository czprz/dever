import {Execute, Runtime} from '../models/dever-json/internal.js';

export class ExecutionResult {
    /**
     * @type {Status}
     */
    status;

    /**
     * @type {string}
     */
    operation;

    /**
     * @type {exception | null}
     */
    error;

    /**
     * @param status {Status}
     * @param operation {string}
     * @param error {exception | null}
     */
    constructor(status, operation, error = null) {
        this.status = status;
        this.operation = operation;
        this.error = error;
    }
}

export class CheckResult {
    /**
     * @type {Status}
     */
    status;

    /**
     * @type {string}
     */
    operation;

    /**
     * @type {exception | null}
     */
    error;

    /**
     *
     * @param status {Status}
     * @param operation {string}
     * @param error {exception | null}
     */
    constructor(status, operation, error = null) {
        this.operation = operation;
        this.status = status;
        this.error = error;
    }
}

export class ExecutionInterface {
    /**
     * @param execute {Execute}
     * @param runtime {Runtime}
     * @returns {Promise<ExecutionResult> | ExecutionResult}
     */
    handle(execute, runtime) {
        throw new Error('ExecutorInterface.handle() is not implemented');
    }

    /**
     * @return {Promise<CheckResult> | CheckResult}
     */
    check() {
        throw new Error('ExecutorInterface.check() is not implemented');
    }
}


export const Status = Object.freeze({'Success': 0, 'Error': 1, 'Warning': 2});