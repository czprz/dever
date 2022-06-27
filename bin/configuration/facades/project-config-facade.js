import localConfig from "../local-config.js";
import json from "../../common/helper/json.js";
import schemaValidator, {SchemaTypes} from "../../common/validators/schema-validator.js";
import versionChecker from "../../common/helper/version-checker.js";
import configValidator from "../../common/helper/config-validator.js";

"use strict";
export default new class {
    /**
     * Any projects added
     * @return {boolean}
     */
    any() {
        const config = localConfig.get();
        if (config == null || config.projects == null) {
            return false;
        }

        return config.projects.length > 0;
    }

    /**
     * Gets only one project by specifically looking through keywords found in .dever
     * @param keyword {string}
     * @returns Project[] | null
     */
    get(keyword) {
        let projects = this.#getProjects()?.filter(x => x != null);
        if (projects == null || projects.length === 0) {
            return null;
        }

        projects = this.#addsKeywordsToInternalOptions(projects);

        projects = projects.filter(x => x.internalOptions.keywords.includes(keyword));

        return projects;
    }

    /**
     * Gets all projects from .dever
     * @returns {Project[] | null}
     */
    getAll() {
        let projects = this.#getProjects()?.filter(x => x != null);
        if (projects == null || projects.length === 0) {
            return null;
        }

        projects = this.#addsKeywordsToInternalOptions(projects);

        return projects;
    }

    /**
     * Get actual value from .dever project
     * @param id {number}
     * @return LocalProject
     */
    getLocalValues(id) {
        const config = localConfig.get();
        return config.projects[id];
    }

    /**
     * @callback updateRequest
     * @param {LocalProject} project
     */

    /**
     *
     * @param id
     * @param fn {updateRequest}
     */
    update(id, fn) {
        const config = localConfig.get();

        fn(config.projects[id]);

        localConfig.write(config);
    }

    /**
     * Removes all projects from .dever
     */
    clear() {
        const config = localConfig.get();

        config.projects = [];

        localConfig.write(config);
    }

    /**
     * Adds project to .dever
     * @param file {string}
     */
    add(file) {
        const config = localConfig.get();

        config.projects.push({
            path: file,
            lastHash: null,
            skipHashCheck: false
        });

        localConfig.write(config);
    }

    /**
     * Removes project from .dever
     * @param file {string}
     */
    remove(file) {
        const config = localConfig.get();
        if (config == null) {
            return;
        }

        const index = config.projects.indexOf(x => x.path === file);
        if (index === -1) {
            return;
        }

        config.projects.splice(index, 1);

        localConfig.write(config);
    }

    /**
     * Gets all projects configuration
     * @returns {Project[] | null}
     */
    #getProjects() {
        const config = localConfig.get();
        if (config == null || config.projects == null || config.projects.length === 0) {
            return null;
        }

        return config.projects.map((x, i) => this.#fetchProject(x, config, i));
    }

    /**
     * gets project configuration
     * @param project {LocalProject}
     * @param config {LocalConfig}
     * @param id {number}
     * @returns {Project}
     */
    #fetchProject(project, config, id) {
        const projectConfig = json.read(project.path);

        if (projectConfig?.version == null) {
            return null;
        }

        return {
            ...projectConfig,
            id: id,
            location: project.path,
            lastHash: project.lastHash,
            skipHashCheck: config.skipAllHashChecks || project.skipHashCheck || false,
            supported: versionChecker.supportedVersion(projectConfig?.version ?? 0),
            validSchema: schemaValidator.validate(SchemaTypes.DeverJson, projectConfig?.version ?? 2, projectConfig),
            validKeywords: configValidator.validate(projectConfig),
            internalOptions: {
                keywords: null
            }
        }
    }

    /**
     * Create custom keywords
     * @param projects {Project[]}
     * @return {Project[]}
     */
    #addsKeywordsToInternalOptions(projects) {
        const duplicateKeywords = projects
            .map(x => x.keywords)
            .flat()
            .filter((item, i, items) => items.indexOf(item) === i && items.lastIndexOf(item) !== i);

        const countOfKeywords = [];
        for (const project of projects) {
            let keywords = project.keywords.map(x => x);

            this.#addCustomKeywords(keywords, duplicateKeywords, countOfKeywords);

            project.internalOptions.keywords = keywords;
        }

        return projects;
    }

    /**
     * Adds custom keywords to project if duplicates are found
     * @param keywords {string[]}
     * @param duplicateKeywords {string[]}
     * @param countOfKeywords {Array<number>}
     */
    #addCustomKeywords(keywords, duplicateKeywords, countOfKeywords) {
        if (keywords.filter(x => duplicateKeywords.includes(x)).length === 0) {
            return;
        }

        duplicateKeywords.forEach(keyword => {
            const count = this.#getKeywordCount(keyword, countOfKeywords);
            keywords.push(`${keyword}${count}`);
        });
    }

    /**
     * Gets and sets project keyword count
     * @param keyword {string}
     * @param countOfKeywords {Array<number>}
     * @returns {number}
     */
    #getKeywordCount(keyword, countOfKeywords) {
        if (countOfKeywords[keyword] == null) {
            countOfKeywords[keyword] = 0;
        }

        countOfKeywords[keyword]++;

        return countOfKeywords[keyword];
    }
}
