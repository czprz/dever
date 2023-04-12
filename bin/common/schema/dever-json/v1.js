const sqlSchema = {
    type: "object",
    properties: {
        username: {type: "string"},
        password: {type: "string"},
        option: {type: "string"},
        database: {type: "string"},
        table: {type: "string"},
        columns: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    key: {type: "string"},
                    valueType: {type: "string"},
                    value: {
                        anyOf: [
                            {
                                type: "string"
                            },
                            {
                                type: "number"
                            }
                        ]
                    }
                },
                required: ["key", "valueType", "value"],
                additionalProperties: false
            }
        }
    },
    required: ["username", "password", "option", "database"],
    additionalProperties: false
};

const containerSchema = {
    type: "object",
    properties: {
        name: {type: "string"},
        image: {type: "string"},
        ports: {
            type: "array",
            items: {
                type: "string",
                pattern: "^\\d{1,5}:\\d{1,5}$"
            }
        },
        variables: {
            type: "array",
            items: {
                type: "string",
                pattern: "^.+=.+$"
            }
        }
    },
    required: ["name", "image"],
    additionalProperties: false
};

const commandSchema = {
    type: "string"
};

const fileSchema = {
    type: "string"
};

const packageSchema = {
    type: "string"
}

const typeSchema = {
    type: "string",
    pattern: "^(docker-container|powershell-command|powershell-script|docker-compose|mssql|chocolatey|winget|tye)$"
};

const waitSchema = {
    type: "object",
    properties: {
        when: {
            type: "string",
            pattern: "^before$|^after$"
        },
        time: {type: "number"}
    },
    required: ["when", "time"],
    additionalProperties: false
};

const optionsSchema = {
    type: "object",
    properties: {
        key: {type: "string"},
        alias: {type: "string"},
        describe: {type: "string"},
        param: {type: "string"},
        required: {type: "boolean"},
        rule: {
            type: "object",
            properties: {
                match: {type: "string"},
                message: {type: "string"}
            },
            required: ["match", "message"],
            additionalProperties: false
        },
        default: {
            anyOf: [
                {
                    type: "string"
                },
                {
                    type: "number"
                },
                {
                    type: "boolean"
                }
            ]
        },
    },
    required: ["key", "alias", "describe", "param"],
    additionalProperties: false
};

const tyeOptionsSchema = {
    type: "object",
    properties: {
        command: {
            type: "string",
            pattern: "^(run|build|deploy|undeploy)$"
        },
        args: {
            type: "array",
            items: {
                type: "string",
                pattern: "^-{1,2}[A-z0-9].*$"
            }
        },
        file: {
            type: "string",
            pattern: "^.*\\.ya?ml$"
        }
    },
    required: ["command"]
};

const executableSchema = {
    type: "object",
    properties: {
        type: typeSchema,
        package: packageSchema,
        sql: sqlSchema,
        command: commandSchema,
        file: fileSchema,
        container: containerSchema,
        tyeOptions: tyeOptionsSchema,
        wait: waitSchema,
        options: {
            type: "array",
            items: optionsSchema
        },
        optional: {type: "boolean"},
        runOnce: {type: "boolean"},
        elevated: {type: "boolean"},
    },
    required: ["type"],
    additionalProperties: false
}

const itemsSchema = {
    type: "object",
    properties: {
        name: {type: "string"},
        type: typeSchema,
        group: {
            anyOf: [
                {
                    type: "string"
                },
                {
                    type: "array"
                }
            ]
        },
        optional: {type: "boolean"},
        runOnce: {type: "boolean"},
        elevated: {type: "boolean"},
        up: executableSchema,
        down: executableSchema,
        package: packageSchema,
        sql: sqlSchema,
        container: containerSchema,
        file: fileSchema,
        command: commandSchema,
        wait: waitSchema,
        before: executableSchema,
        after: executableSchema,
        options: {
            type: "array",
            items: optionsSchema
        }
    },
    required: ["name"],
    additionalProperties: false
};

const propertiesSchema = {
    type: "object",
    properties: {
        elevated: {type: "boolean"},
        name_required: {type: "boolean"}
    },
    additionalProperties: false
};

const segmentSchema = {
    type: "object",
    properties: {
        key: {type: "string"},
        name: {type: "string"},
        description: {type: "string"},
        properties: propertiesSchema,
        actions: {
            type: "array",
            items: itemsSchema
        }
    },
    required: ["key", "name", "description", "actions"],
    additionalProperties: false
};

export default {
    type: "object",
    properties: {
        version: {type: "number"},
        name: {type: "string"},
        keywords: {
            type: "array",
            items: {type: "string"}
        },
        segments: {
            type: "array",
            items: segmentSchema
        }
    },
    required: ["version", "name", "keywords"],
    additionalProperties: false
}
