export default {
    type: "object",
    properties: {
        projects: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    path: {type: "string"},
                    lastHash: {type: ["string", "null"]},
                    skipHashCheck: {type: "boolean"},
                    hasRunActions: {
                        type: ["array", "null"],
                        items: {
                            type: "object",
                            properties: {
                                name: {type: "string"},
                                hasRun: {type: "boolean"},
                                lastHash: {type: ["string"]}
                            }
                        }
                    },
                },
                required: ["path", "lastHash", "skipHashCheck"],
                additionalProperties: false
            }
        },
        skipAllHashChecks: {type: "boolean"},
        lastVersionCheckMs: {type: "number"},
        latestVersion: {type: ["string", "null"]},
        migrationVersion: {type: "number"}
    },
    required: ["projects", "skipAllHashChecks", "migrationVersion"],
    additionalProperties: false
}