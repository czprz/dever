import {Operation as DComOperation} from '../executions/docker-compose/index.js';
import {Operation as DConOperation} from '../executions/docker-container/index.js';
import {Operation as PSScriptOperation} from '../executions/powershell-script/index.js';
import {Operation as PSCommandOperation} from '../executions/powershell-command/index.js';
import {Operation as MSSQLOperation} from '../executions/mssql/index.js';
import {Operation as ChocolateyOperation} from '../executions/chocolatey/index.js';

import {Executable} from "../../models/dever-json/internal.js";
import {Result, Status} from "../models.js";

import logger from "../../helper/logger.js";

export default new class {
    /**
     * Handles error messages
     * @param result {Result}
     * @param executable {Executable}
     */
    respond(result, executable) {
        let response = null;

        switch (result.type) {
            case "docker-compose":
                response = this.#docker_compose(result, executable);
                break;
            case "docker-container":
                response = this.#docker_container(result, executable);
                break;
            case "powershell-script":
                response = this.#powershell_script(result, executable);
                break;
            case "powershell-command":
                response = this.#powershell_command(result, executable);
                break;
            case "mssql":
                response = this.#mssql(result, executable);
                break;
            case "chocolatey":
                response = this.#chocolatey(result, executable);
                break;
            default:
                break;
        }

        this.#send(response);
    }

    /**
     * Handles error messages for type docker-compose
     * @param result
     * @param executable
     * @return {Response}
     */
    #docker_compose(result, executable) {
        switch (result.operation) {
            case DComOperation.Created:
                return new Response(result, `docker-compose: '${executable.name}' has been created and started`);
            case DComOperation.Started:
                return new Response(result, `docker-compose: '${executable.name}' has been started`);
            case DComOperation.Stopped:
                return new Response(result, `docker-compose: '${executable.name}' has been stopped`);
            case DComOperation.Recreated:
                return new Response(result, `docker-compose: '${executable.name}' has been recreated`);
            case DComOperation.AlreadyRunning:
                return new Response(result, `docker-compose: '${executable.name}' is already running`);
            case DComOperation.DependencyCheck:
                return new Response(result, `Docker engine not running. Please start docker and retry command`);
            default:
                break;
        }
    }

    /**
     * Handles error messages for type docker-container
     * @param result {Result}
     * @param executable {Executable}
     * @return {Response}
     */
    #docker_container(result, executable) {
        switch (result.operation) {
            case DConOperation.Created:
                return new Response(result, `docker-container: '${executable.name}' has been created and started`);
            case DConOperation.Started:
                return new Response(result, `docker-container: '${executable.name}' has been started`);
            case DConOperation.Stopped:
                return new Response(result, `docker-container: '${executable.name}' has been stopped`);
            case DConOperation.Recreated:
                return new Response(result, `docker-container: '${executable.name}' has been recreated`);
            case DConOperation.AlreadyRunning:
                return new Response(result, `docker-container: '${executable.name}' is already running`);
            case DConOperation.NotFound:
                return new Response(result, `docker-container: '${executable.name}' not found`);
            case DConOperation.NotRunning:
                return new Response(result, `docker-container: '${executable.name}' is not running`);
            case DConOperation.DependencyCheck:
                return new Response(result, `Docker engine not running. Please start docker and retry command`);
            default:
                break;
        }
    }

    /**
     * Handles error messages for type powershell-script
     * @param result {Result}
     * @param executable {Executable}
     * @return {Response}
     */
    #powershell_script(result, executable) {
        switch (result.operation) {
            case PSScriptOperation.Executed:
                return new Response(result, `powershell-script: '${executable.name}' has been executed`);
            case PSScriptOperation.NotExecuted:
                return new Response(result, `powershell-script: '${executable.name}' has been executed with errors`);
            default:
                break;
        }
    }

    /**
     * Handles error messages for type powershell-command
     * @param result {Result}
     * @param executable {Executable}
     * @return {Response}
     */
    #powershell_command(result, executable) {
        switch (result.operation) {
            case PSCommandOperation.Executed:
                return new Response(result, `powershell-command: '${executable.name}' has been executed`);
            case PSCommandOperation.NotExecuted:
                return new Response(result, `powershell-command: '${executable.name}' has been executed with errors`);
            default:
                break;
        }
    }

    /**
     * Handles error messages for type mssql
     * @param result {Result}
     * @param executable {Executable}
     * @return {Response}
     */
    #mssql(result, executable) {
        switch (result.operation) {
            case MSSQLOperation.DatabaseCreated:
                return new Response(result, `mssql: '${executable.name}' database has been created`);
            case MSSQLOperation.NotDatabaseCreated:
                return new Response(result, `mssql: '${executable.name}' database was not created due to errors`);
            case MSSQLOperation.DatabaseDropped:
                return new Response(result, `mssql: '${executable.name}' database has been dropped`);
            case MSSQLOperation.NotDatabaseDropped:
                return new Response(result, `mssql: '${executable.name}' database was not dropped due to errors`);
            case MSSQLOperation.DatabaseAlreadyExists:
                return new Response(result, `mssql: '${executable.name}' database already exists`);
            case MSSQLOperation.DatabaseNotFound:
                return new Response(result, `mssql: '${executable.name}' database not found`);
            case MSSQLOperation.TableCreated:
                return new Response(result, `mssql: '${executable.name}' table has been created`);
            case MSSQLOperation.NotTableCreated:
                return new Response(result, `mssql: '${executable.name}' table was not created due to errors`);
            case MSSQLOperation.TableDropped:
                return new Response(result, `mssql: '${executable.name}' table has been dropped`);
            case MSSQLOperation.TableAlreadyExists:
                return new Response(result, `mssql: '${executable.name}' table already exists`);
            case MSSQLOperation.Inserted:
                return new Response(result, `mssql: '${executable.name}' data has been inserted`);
            case MSSQLOperation.NotInserted:
                return new Response(result, `mssql: '${executable.name}' data was not inserted due to errors`);
            case MSSQLOperation.TableOrColumnsNotFound:
                return new Response(result, `mssql: '${executable.name}' table or columns not found`);
            case MSSQLOperation.NotSupported:
                return new Response(result, `mssql: '${executable.name}' sql option is not supported!`);
            default:
                break;
        }
    }

    /**
     * Handles error messages for type chocolatey
     * @param result {Result}
     * @param executable {Executable}
     * @return {Response}
     */
    #chocolatey(result, executable) {
        switch (result.operation) {
            case ChocolateyOperation.Install:
                return new Response(result, `chocolatey: '${executable.name}' has been installed`);
            case ChocolateyOperation.NotInstall:
                return new Response(result, `chocolatey: '${executable.name}' was not installed due to errors`);
            case ChocolateyOperation.Uninstall:
                return new Response(result, `chocolatey: '${executable.name}' has been uninstalled`);
            case ChocolateyOperation.NotUninstall:
                return new Response(result, `chocolatey: '${executable.name}' was not uninstalled due to errors`);
            case ChocolateyOperation.DependencyCheck:
                return new Response(result, `Chocolatey not installed. Please install chocolatey and retry command`);
        }
    }

    /**
     * Outputs response to the console
     * @param response {Response}
     */
    #send(response) {
        switch (response.type) {
            case 'success':
                logger.info(response.message);
                break;
            case 'error':
                logger.error(response.message, response.error);
                break;
            case 'warning':
                logger.warn(response.message);
                break;
            default:
                throw new Error(`Unknown response type: ${response.type}`);
        }
    }
}

class Response {
    /**
     * @type {'warning', 'error', 'success'}
     */
    type;

    /**
     * @type {string}
     */
    message;

    /**
     * @type {exception | null}
     */
    error;

    /**
     *
     * @param result {Result}
     * @param message {string}
     */
    constructor(result, message) {
        this.type = Response.#map(result.status);
        this.message = message;
        this.error = result.error;
    }

    /**
     *
     * @param type {Status}
     * @return {string}
     */
    static #map(type) {
        switch (type) {
            case Status.Success:
                return 'success';
            case Status.Error:
                return 'error';
            case Status.Warning:
                return 'warning';
            default:
                throw new Error(`Unknown status type: ${type}`);
        }
    }
}