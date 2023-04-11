import path from "path";
import versionChecker from "../../common/helper/version-checker.js";
import schemaValidator, {SchemaTypes} from "../../common/validators/schema-validator.js";
import configValidator from "../../common/helper/config-validator.js";

// noinspection ES6UnusedImports
import {
    Container as InContainer,
    Project as InProject,
    Segment as InSegment,
    Action as InAction,
    Option as InOption,
    Execution as InExecution
} from '../../common/models/dever-json/internal.js';
// noinspection ES6UnusedImports
import {
    Container as ExContainer,
    Project as ExProject,
    Segment as ExSegment,
    Action as ExAction,
    Option as ExOption,
    Execution as ExExecution
} from '../../common/models/dever-json/external.js';

export default new class {
    /**
     * @param id {number}
     * @param config {{path: string, lastHash: string, skipHashCheck: boolean, skipAllHashChecks: boolean, hasRunActions: HasRunAction[]}}
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
            segments: this.#mapSegments(external.segments, config.hasRunActions),
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
     * @param hasRunActions {HasRunAction[]}
     * @returns {InSegment[]}
     */
    #mapSegments(segments, hasRunActions) {
        return segments?.map(x => {
            return {
                key: x.key,
                name: x.name,
                description: x.description,
                properties: {
                    elevated: x.properties?.elevated ?? false,
                    name_required: x.properties?.name_required ?? false
                },
                actions: this.#mapActions(x.actions, hasRunActions)
            }
        });
    }

    /**
     *
     * @param actions {ExAction[]}
     * @param hasRunActions {HasRunAction[]}
     * @return {InAction[]}
     */
    #mapActions(actions, hasRunActions) {
        return actions?.map(x => {
            return {
                ...this.#mapExecution(x, null),
                name: x.name,
                hasRun: hasRunActions?.find(y => y.name === x.name)?.hasRun ?? false,
                lastHash: hasRunActions?.find(y => y.name === x.name)?.lastHash ?? null,
                group: this.mapGroup(x.group),
                up: this.#mapExecution(x.up, x),
                down: this.#mapExecution(x.down, x),
                wait: x.wait,
                after: this.#mapExecution(x.after, x),
                before: this.#mapExecution(x.before, x),
            }
        })
    }

    /**
     *
     * @param execution {ExExecution|ExAction}
     * @param action {ExAction|null}
     * @returns {InExecution}
     */
    #mapExecution(execution, action) {
        if (execution == null) {
            return null;
        }

        return {
            type: execution.type,
            file: execution.file,
            command: execution.command,
            sql: execution.sql,
            container: this.#mapContainer(execution.container),
            package: execution.package,
            wait: execution.wait,
            options: this.#mapOptions(execution.options),
            elevated: execution.elevated ?? action?.elevated,
            optional: execution.optional ?? action?.optional,
            runOnce: execution.runOnce ?? action?.runOnce,
        }
    }

    /**
     * @param container {ExContainer}
     * @returns {InContainer}
     */
    #mapContainer(container) {
        if (container == null) {
            return null;
        }

        return {
            name: container.name,
            ports: container.ports ?? [],
            variables: container.variables ?? [],
            image: container.image
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

    /**
     * Map possible string or array of strings to array of strings
     * @param group {string|Array<string>}
     * @return {Array<string>}
     */
    mapGroup(group) {
        if (group == null) {
            return [];
        }

        if (Array.isArray(group)) {
            return group;
        }

        return [group];
    }
}