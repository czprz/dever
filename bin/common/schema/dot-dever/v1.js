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
                    skipHashCheck: {type: "boolean"}
                },
                required: ["path", "lastHash", "skipHashCheck"],
                additionalProperties: false
            }
        },
        skipAllHashChecks: {type: "boolean"}
    },
    required: ["projects", "skipAllHashChecks"],
    additionalProperties: false
}