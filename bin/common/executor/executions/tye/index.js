import {ExecutionInterface} from "../../models.js";
import docker from "../../../helper/docker/index.js";

import {exec} from "child_process";
import path from "path";
import os from "os";

"use strict";
export default new class extends ExecutionInterface {
    /**
     * Execution type
     * @type {string}
     * @private
     */
    _type = 'tye';

    /**
     * Check dependencies for tye execution
     */
    check() {
        if (!docker.is_docker_running()) {
            return this._error(Operation.CheckIfDockerIsRunning, null, true);
        }

        try {
            exec('tye -?', {windowsHide: true, encoding: 'UTF-8', stdio: "ignore"});
            return this._success(Operation.CheckIfTyeIsInstalled, true);
        } catch {
            return this._error(Operation.DependencyCheck, null, true);
        }
    }

    /**
     * Executes tye
     */
    async _execute(execute, runtime) {
        const start = runtime.up ? Operation.Starting : Operation.Stopping;
        const end = runtime.up ? Operation.Started : Operation.Stopped;

        try {
            this._started(start);

            let command = `tye`;
            command = this.#addCommand(command, execute);
            command = this.#addArgs(command, execute);
            command = this.#addConfigFile(command, execute);

            const workingDir = execute.location;
            const shellCommand = this.#makeCommand(workingDir, command);

            const childProcess = exec(shellCommand, {
                detached: true,
                stdio: 'ignore',
                shell: true,
                timeout: 1000
            });

            childProcess.unref();

            this._success(end);
        } catch (e) {
            this._error(end, e);
        }
    }

    /**
     * Constructs shell command
     * @param workingDir {string}
     * @param command {string}
     * @returns {string}
     */
    #makeCommand(workingDir, command) {
        let shellCommand = '';

        switch (os.platform()) {
            case 'win32':
                shellCommand = `start powershell.exe -command "cd ${workingDir} ; ${command}"`;
                break;
            case 'darwin':
                shellCommand = `osascript -e 'tell app "Terminal" to do script "cd ${workingDir} ; ${command}"'`;
                break;
            case 'linux':
                shellCommand = `gnome-terminal --working-directory="${workingDir}" -- bash -c "${command}"`;
                break;
            default:
                throw new Error(`Unsupported platform: ${os.platform()}`);
        }

        return shellCommand;
    }

    /**
     * Adds config files to command
     * @param command {string}
     * @param execute {Execute}
     * @returns {string}
     */
    #addConfigFile(command, execute) {
        if (!execute.tyeOptions.files || execute.tyeOptions.files.length === 0) {
            return command;
        }

        const filePath = path.join(execute.location, execute.tyeOptions.file);
        return `${command} ${filePath}`;
    }

    /**
     * Adds command to tye command
     * @param command {string}
     * @param execute {Execute}
     * @returns {string}
     */
    #addCommand(command, execute) {
        return `${command} ${execute.tyeOptions.command}`;
    }

    #addArgs(command, execute) {
        if (!execute.tyeOptions.args || execute.tyeOptions.args.length === 0) {
            return command;
        }

        return `${command} ${execute.tyeOptions.args.join(' ')}`;
    }
}

export const Operation = Object.freeze({
    Starting: 'starting',
    Started: 'started',
    Stopping: 'stopping',
    Stopped: 'stopped',
    CheckIfDockerIsRunning: 'check-docker',
    CheckIfTyeIsInstalled: 'check-tye',
});