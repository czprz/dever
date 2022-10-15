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
            case Operation.DatabaseCreated:
                this._inform('success', `mssql: '${name}' database has been created`);
                break;
            case Operation.NotDatabaseCreated:
                this._inform('error', `mssql: '${name}' database was not created due to errors`);
                break;
            case Operation.DatabaseDropped:
                this._inform('success', `mssql: '${name}' database has been dropped`);
                break;
            case Operation.NotDatabaseDropped:
                this._inform('error', `mssql: '${name}' database was not dropped due to errors`);
                break;
            case Operation.TableCreated:
                this._inform('success', `mssql: '${name}' table has been created`);
                break;
            case Operation.NotTableCreated:
                this._inform('error', `mssql: '${name}' table was not created due to errors`);
                break;
            case Operation.TableDropped:
                this._inform('success', `mssql: '${name}' table has been dropped`);
                break;
            case Operation.Inserted:
                this._inform('success', `mssql: '${name}' data has been inserted`);
                break;
            case Operation.NotInserted:
                this._inform('error', `mssql: '${name}' data was not inserted due to errors`);
                break;
            case Operation.NotSupported:
                this._inform('error', `mssql: '${name}' operation is not supported`);
                break;
            case Operation.DependencyCheck:
                this._inform('error', `MSSQL not running. Please start MSSQL and retry command`);
                break;
            case Operation.NoColumns:
                this._inform('error', `mssql: '${name}' no columns found`);
                break;
            case Operation.NoTable:
                this._inform('error', `mssql: '${name}' no table found`);
                break;
            case Operation.NoDatabase:
                this._inform('error', `mssql: '${name}' no database found`);
                break;
            case Operation.DatabaseExists:
                this._inform('error', `mssql: '${name}' database already exists`);
                break;
            case Operation.TableExists:
                this._inform('error', `mssql: '${name}' table already exists`);
                break;
            default:
                break;
        }
    }
}