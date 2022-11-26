import readline from "readline";
import os from "os";
import fs from "fs";
import path from "path";
import chalk from "chalk";

import json from "./common/helper/json.js";

"use strict";
export default new class {
    #fileName = 'dever.json';

    #root;
    #filePath;

    constructor() {
        this.#root = os.homedir();
        this.#filePath = path.join(this.#root, this.#fileName);
    }

    /**
     * Add dever to project
     * @return {Promise<void>}
     */
    async init(_path) {
        _path = typeof _path === 'string' && 'dever.json' !== path.basename(_path) ? path.join(_path, 'dever.json') : _path;
        const projectPath = _path ?? this.#filePath;
        const dir = path.dirname(projectPath);

        if (!fs.existsSync(dir)) {
            this.#folderDoesNotExist(dir);
            return;
        }

        const config = json.read(projectPath);
        if (Object.keys(config).length > 0) {
            this.#deverAlreadyExists(projectPath);
            return;
        }

        const rl = readline.createInterface(process.stdin, process.stdout);
        await rl.question(`Are you sure that you want to add dever support to project? (${projectPath}) [yes]/no:`, async (answer) => {
            const lcAnswer = answer.toLowerCase();
            if (lcAnswer === 'y' || lcAnswer === 'yes') {
                this.#addDeverToProject(projectPath);
            }

            rl.close();
        });
    }

    #addDeverToProject(path) {
        json.write(path, {
            version: 1,
            name: "example-project-dever",
            keywords: [
                "example",
                "ex",
                "example-project",
                "example-project-dever"
            ],
            segments: [
                {
                    "key": "env",
                    "name": "Environment",
                    "description": "Environment setup",
                    "properties": {
                        "name_required": false,
                        "elevated": false
                    },
                    actions: [
                        {
                            "name": "ps-cmd",
                            "optional": false,
                            "type": "powershell-command",
                            "command": "echo 'test'",
                            "wait": {
                                "when": "before",
                                "time": 1000
                            }
                        },
                        {
                            "name": "ps-cmd-2",
                            "optional": false,
                            "runOnce": true,
                            "up": {
                                "type": "powershell-command",
                                "command": "echo 'up'",
                            },
                            "down": {
                                "type": "powershell-command",
                                "command": "echo 'down'",
                            }
                        },
                        {
                            "name": "ps-script",
                            "optional": false,
                            "type": "powershell-script",
                            "file": "/path/to/script.ps1"
                        },
                        {
                            "name": "mssql",
                            "type": "docker-container",
                            "container": {
                                "name": "mssql",
                                "image": "mcr.microsoft.com/mssql/server:2019-latest",
                                "ports": ["1433:1433"],
                                "variables": [
                                    "ACCEPT_EULA=Y",
                                    "SA_PASSWORD=Password123"
                                ],
                            }
                        },
                        {
                            "name": "create-database",
                            "type": "mssql",
                            "sql": {
                                "username": "sa",
                                "password": "Password123",
                                "option": "create-database",
                                "database": "example"
                            }
                        },
                        {
                            "name": "create-table",
                            "type": "mssql",
                            "sql": {
                                "username": "sa",
                                "password": "Password123",
                                "option": "insert",
                                "database": "example",
                                "table": "example",
                                "columns": [
                                    {
                                        "key": "name",
                                        "valueType": "varchar(255)",
                                        "value": "testing?"
                                    },
                                    {
                                        "key": "Id",
                                        "valueType": "int",
                                        "value": 55
                                    }
                                ]
                            }
                        }
                    ]
                }
            ]
        });
    }

    #deverAlreadyExists(path) {
        console.log(chalk.yellow(`dever is already initialized: ${path}. To reinitialize, please delete dever.json`));
    }

    #folderDoesNotExist(dir) {
        console.error(chalk.redBright(`Project folder does not exist: ${dir}`));
    }
}
