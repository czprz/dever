import {Operation} from "../../executions/mssql/index.js";
import {Informer} from "../../models.js";

export default new class extends Informer {
    /**
     * Handles handlers for each environment dependency
     * @param log {ExecutionLog}
     * @param name {string}
     */
    inform(log, name) {
        switch (log.operation) {
            case Operation.DatabaseCreating:
                this._inform_partial(`mssql: '${name}' database is being created... `, log);
                break;
            case Operation.DatabaseCreated:
                this._inform_partial('done', log);
                break;
            case Operation.NotDatabaseCreated:
                this._inform_partial('failed', log);
                break;
            case Operation.DatabaseDropping:
                this._inform_partial(`mssql: '${name}' database is being dropped... `, log);
                break;
            case Operation.DatabaseDropped:
                this._inform_partial('done', log);
                break;
            case Operation.NotDatabaseDropped:
                this._inform_partial('failed', log);
                break;
            case Operation.TableCreated:
                this._inform_partial(`mssql: '${name}' table is being created... `, log);
                break;
            case Operation.NotTableCreated:
                this._inform_partial('failed', log);
                break;
            case Operation.TableDropped:
                this._inform_partial('done', log);
                break;
            case Operation.Inserting:
                this._inform_partial(`mssql: '${name}' data is being inserted... `, log);
                break;
            case Operation.Inserted:
                this._inform_partial('done', log);
                break;
            case Operation.NotInserted:
                this._inform_partial('failed', log);
                break;
            case Operation.NotSupported:
                this._inform('error', `mssql: '${name}' operation is not supported`);
                break;
            case Operation.DependencyCheck:
                this._inform('error', `MSSQL not running. Please start MSSQL and retry command`);
                break;
            case Operation.NoColumns:
                this._inform_partial('failed. No columns found', log);
                break;
            case Operation.NoTable:
                this._inform_partial('failed. No table found', log);
                break;
            case Operation.NoDatabase:
                this._inform_partial('failed. No database found', log);
                break;
            case Operation.DatabaseExists:
                this._inform_partial(`failed. Database already exists`, log);
                break;
            case Operation.TableExists:
                this._inform_partial(`failed. Table already exists`, log);
                break;
            default:
                break;
        }
    }
}