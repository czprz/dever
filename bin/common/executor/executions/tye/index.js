import {ExecutionInterface} from "../../models.js";
import docker from "../../../helper/docker/index.js";
import platformSelector from "../../../helper/platform-selector.js";

import {exec, execSync} from "child_process";
import path from "path";

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
            execSync('tye -?', {windowsHide: true, encoding: 'UTF-8', stdio: "ignore"});
            return this._success(Operation.DependencyCheck, true);
        } catch {
            return this._error(Operation.CheckIfTyeIsInstalled, null, true);
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
            const shellCommand = platformSelector.get({
                windows: `start powershell.exe -command "cd ${workingDir} ; ${command}"`,
                darwin: `osascript -e 'tell app "Terminal" to do script "cd ${workingDir} ; ${command}"'`,
                linux: `gnome-terminal --working-directory="${workingDir}" -- bash -c "${command}"`,
            });

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

    /**
     * Adds arguments to tye command
     * @param command {string}
     * @param execute {Execute}
     * @returns {string}
     */
    #addArgs(command, execute) {
        if (!execute.tyeOptions.args || execute.tyeOptions.args.length === 0) {
            return command;
        }

        this.#checkArgs(execute);

        return `${command} ${execute.tyeOptions.args.join(' ')}`;
    }

    /**
     * Checks if arguments are valid
     * @param execute {Execute}
     */
    #checkArgs(execute) {
        for (const arg of execute.tyeOptions.args) {
            if (!this.IsValidArgument(arg)) {
                throw new Error('Semicolon or ampersand is not allowed in tye arguments.');
            }
        }
    }

    IsValidArgument(str) {
        if (str.split(/\r?\n/).length > 1) {
            return false;
        }

        const line = str.trim();
        if (!line.startsWith('-')) {
            return false;
        }

        return !(line.includes(';') || line.includes('&&'));
    }
}

export const Operation = Object.freeze({
    Starting: 'starting',
    Started: 'started',
    Stopping: 'stopping',
    Stopped: 'stopped',
    CheckIfDockerIsRunning: 'check-docker',
    CheckIfTyeIsInstalled: 'check-tye',
    DependencyCheck: 'dependency-check',
});