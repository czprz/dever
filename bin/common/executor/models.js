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

export const Status = Object.freeze({'Success': 0, 'Error': 1, 'Warning': 2});