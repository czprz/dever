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

const typeSchema = {
    type: "string",
    pattern: "^docker-container$|^powershell-command$|^powershell-script$|^docker-compose$|^mssql$"
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
            items: {
                type: "object",
                properties: {
                    type: {
                        type: "string",
                        pattern: "^(chocolatey)$"
                    },
                    package: {type: "string"},
                    group: {type: "string"},
                    after: {
                        type: "object",
                        properties: {
                            type: {
                                type: "string",
                                pattern: "^(powershell-command)$"
                            },
                            command: {type: "string"}
                        }
                    },
                    before: {
                        type: "object",
                        properties: {
                            type: {
                                type: "string",
                                pattern: "^(powershell-command)$"
                            },
                            command: {type: "string"}
                        }
                    },
                },
                required: ["type", "package"]
            }
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
        environment: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    name: {type: "string"},
                    type: typeSchema,
                    group: {type: "string"},
                    default: {type: "boolean"},
                    start: {
                        type: "object",
                        properties: {
                            type: typeSchema,
                            sql: sqlSchema,
                            command: commandSchema,
                            file: fileSchema,
                            container: containerSchema,
                            wait: waitSchema
                        },
                        required: ["type"]
                    },
                    end: {
                        type: "object",
                        properties: {
                            type: typeSchema,
                            sql: sqlSchema,
                            command: commandSchema,
                            file: fileSchema,
                            container: containerSchema,
                            wait: waitSchema
                        },
                        required: ["type"]
                    },
                    sql: sqlSchema,
                    container: containerSchema,
                    file: fileSchema,
                    command: commandSchema,
                    wait: waitSchema
                },
                required: ["name"]
            }
        }
    },
    required: ["version", "name", "keywords"],
    additionalProperties: false
}
