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
    pattern: "^(docker-container|powershell-command|powershell-script|docker-compose|mssql|chocolatey)$"
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

const executableSchema = {
    type: "object",
    properties: {
        type: typeSchema,
        package: packageSchema,
        sql: sqlSchema,
        command: commandSchema,
        file: fileSchema,
        container: containerSchema,
        wait: waitSchema
    },
    required: ["type"],
    additionalProperties: false
}

const itemsSchema = {
    type: "object",
    properties: {
        name: {type: "string"},
        type: typeSchema,
        group: {type: "string"},
        optional: {type: "boolean"},
        up: executableSchema,
        down: executableSchema,
        package: packageSchema,
        sql: sqlSchema,
        container: containerSchema,
        file: fileSchema,
        command: commandSchema,
        wait: waitSchema,
        before: executableSchema,
        after: executableSchema
    },
    required: ["name"],
    additionalProperties: false
};

const propertiesSchema = {
    type: "object",
    properties: {
        elevated: {type: "boolean"},
        name_required: {type: "boolean"},
        simple_run: {type: "boolean"}
    },
    additionalProperties: false
};

const segmentSchema = {
    type: "object",
    properties: {
        key: {type: "string"},
        name: {type: "string"},
        description: {type:"string"},
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
        install: {
            type: "array",
            items: itemsSchema
        },
        fix: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    key: {type: "string"},
                    type: {
                        type: "string",
                        pattern: "^(powershell-command|powershell-script)$"
                    },
                    command: {type: "string"},
                    file: {type: "string"}
                },
                required: ["key", "type"],
            }
        },
        segments: {
            type: "array",
            items: segmentSchema
        },
        environment: {
            type: "array",
            items: itemsSchema
        }
    },
    required: ["version", "name", "keywords"],
    additionalProperties: false
}
