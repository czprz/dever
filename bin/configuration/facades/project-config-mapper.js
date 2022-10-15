import path from "path";
import versionChecker from "../../common/helper/version-checker.js";
import schemaValidator, {SchemaTypes} from "../../common/validators/schema-validator.js";
import configValidator from "../../common/helper/config-validator.js";

// noinspection ES6UnusedImports
import {
    Project as InProject,
    Segment as InSegment,
    Action as InAction,
    Option as InOption,
    Execution as InExecution
} from '../../common/models/dever-json/internal.js';
// noinspection ES6UnusedImports
import {
    Project as ExProject,
    Segment as ExSegment,
    Action as ExAction,
    Option as ExOption,
    Execution as ExExecution
} from '../../common/models/dever-json/external.js';

export default new class {
    /**
     * @param id {number}
     * @param config {{path: string, lastHash: string, skipHashCheck: boolean, skipAllHashChecks: boolean}}
     * @param external {ExProject}
     * @returns {InProject}
     */
    map(id, config, external) {
        if (external?.version == null) {
            return this.#defaultVersion(id, config);
        }

        // noinspection JSCheckFunctionSignatures
        const validSchema = schemaValidator.validate(SchemaTypes.DeverJson, external.version, external);
        return {
            id: id,
            name: external.name,
            version: external.version,
            keywords: external.keywords,
            location: {
                full: config.path,
                partial: path.dirname(config.path)
            },
            segments: this.#mapSegments(external.segments),
            lastHash: config.lastHash,
            skipHashCheck: config.skipAllHashChecks || config.skipHashCheck || false,
            supported: versionChecker.supportedVersion(external.version),
            validSchema: validSchema,
            validKeywords: configValidator.validate(external),
            internal: {
                keywords: null
            }
        }
    }

    /**
     *
     * @param segments {ExSegment[]}
     * @returns {InSegment[]}
     */
    #mapSegments(segments) {
        return segments?.map(x => {
            return {
                key: x.key,
                name: x.name,
                description: x.description,
                properties: {
                    elevated: x.properties?.elevated ?? false,
                    name_required: x.properties?.name_required ?? false
                },
                actions: this.#mapActions(x.actions)
            }
        });
    }

    /**
     *
     * @param actions {ExAction[]}
     * @return {InAction[]}
     */
    #mapActions(actions) {
        return actions?.map(x => {
            return {
                ...this.#mapExecution(x),
                name: x.name,
                optional: x.optional ?? false,
                group: x.group,
                up: this.#mapExecution(x.up),
                down: this.#mapExecution(x.down),
                wait: x.wait,
                after: this.#mapExecution(x.after),
                before: this.#mapExecution(x.before),
            }
        })
    }

    /**
     *
     * @param execution {ExExecution|ExAction}
     * @returns {InExecution}
     */
    #mapExecution(execution) {
        if (execution == null) {
            return null;
        }

        return {
            type: execution.type,
            file: execution.file,
            command: execution.command,
            sql: execution.sql,
            container: execution.container,
            package: execution.package,
            runAsElevated: execution.runAsElevated ?? false,
            wait: execution.wait,
            options: this.#mapOptions(execution.options)
        }
    }

    /**
     *
     * @param options {ExOption[]}
     * @return {InOption[]}
     */
    #mapOptions(options) {
        return options?.map(x => {
            return {
                required: x.required ?? false,
                key: x.key,
                alias: x.alias,
                describe: x.describe,
                param: x.param,
                rule: x.rule,
                default: x.default
            }
        })
    }

    /**
     *
     * @param id {number}
     * @param config {{path: string, lastHash: string, skipHashCheck: boolean, skipAllHashChecks: boolean}}
     * @returns {InProject}
     */
    #defaultVersion(id, config) {
        return {
            id: id,
            lastHash: config.lastHash,
            skipHashCheck: config.skipAllHashChecks || config.skipHashCheck || false,
            location: {
                full: config.path,
                partial: path.dirname(config.path)
            },
            supported: false,
            validSchema: false,
            validKeywords: false,
            internal: {
                keywords: null
            }
        };
    }
}