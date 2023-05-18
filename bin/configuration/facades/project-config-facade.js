import json from "../../common/helper/json.js";
import projectConfigMapper from "./project-config-mapper.js";
import ConfigFacade from "./config-facade.js";

import {Project} from "../../common/models/dever-json/internal.js";
// noinspection ES6UnusedImports
import {Config as ExternalConfig, Project as ExternalProject} from "../../common/models/dot-dever/external.js";
// noinspection ES6UnusedImports
import {Project as ExternalConfigProject} from "../../common/models/dever-json/external.js";

"use strict";
export default new class {
    /**
     * Any projects added
     * @return {boolean}
     */
    any() {
        const projects = ConfigFacade.getSingle(x => x?.projects);
        if (projects == null) {
            return false;
        }

        return projects.length > 0;
    }

    /**
     * Gets only one project by specifically looking through keywords found in .dever
     * @param keyword {string}
     * @returns {Project[] | null}
     */
    get(keyword) {
        let projects = this.#getProjects()?.filter(x => x != null);
        if (projects == null || projects.length === 0) {
            return [];
        }

        projects = this.#addsKeywordsToInternalOptions(projects);

        projects = projects.filter(x => x.internal.keywords.includes(keyword));

        return projects;
    }

    /**
     * Gets all projects from .dever
     * @returns {Project[] | null}
     */
    getAll() {
        let projects = this.#getProjects()?.filter(x => x != null);
        if (projects == null || projects.length === 0) {
            return [];
        }

        projects = this.#addsKeywordsToInternalOptions(projects);

        return projects;
    }

    /**
     * Get actual value from .dever project
     * @param id {number}
     * @return {ExternalProject | null}
     */
    getLocalValues(id) {
        const projects = ConfigFacade.getSingle(x => x?.projects);
        return projects[id];
    }

    /**
     * @callback getSingleRequest
     * @param {ExternalProject} config
     */

    /**
     * @param id {number}
     * @param fn {getSingleRequest}
     * @return {any}
     */
    getSingle(id, fn) {
        const projects = ConfigFacade.getSingle(x => x?.projects);
        if (projects == null || projects.length === 0) {
            throw new Error("No projects found");
        }

        return fn(projects[id]);
    }

    /**
     * @callback updateRequest
     * @param {ExternalProject} project
     */

    /**
     *
     * @param id
     * @param fn {updateRequest}
     */
    update(id, fn) {
        const projects = ConfigFacade.getSingle(x => x?.projects);
        if (projects == null || projects.length === 0) {
            throw new Error("No projects found");
        }

        fn(projects[id]);

        ConfigFacade.update(x => x.projects = projects);
    }

    /**
     * Adds project to .dever
     * @param file {string}
     */
    add(file) {
        const projects = ConfigFacade.getSingle(x => x?.projects);

        projects.push({
            path: file,
            lastHash: null,
            skipHashCheck: false,
            hasRunActions: [],
        });

        ConfigFacade.update(x => x.projects = projects);
    }

    /**
     * Removes project from .dever
     * @param id {number}
     */
    remove(id) {
        const projects = ConfigFacade.getSingle(x => x?.projects);
        if (projects == null || projects.length === 0) {
            return;
        }

        projects.splice(id, 1);

        ConfigFacade.update(x => x.projects = projects);
    }

    /**
     * Gets all projects configuration
     * @returns {Project[] | null}
     */
    #getProjects() {
        const config = ConfigFacade.get();
        if (config == null || config.projects == null || config.projects.length === 0) {
            return null;
        }

        return config.projects.map((x, i) => this.#fetchProject(x, config, i));
    }

    /**
     * gets project configuration
     * @param project {ExternalProject}
     * @param config {ExternalConfig}
     * @param id {number}
     * @returns {Project}
     */
    #fetchProject(project, config, id) {
        const projectConfig = json.read(project.path);
        return projectConfigMapper.map(id, {
            path: project.path,
            lastHash: project.lastHash,
            skipHashCheck: project.skipHashCheck,
            skipAllHashChecks: config.skipAllHashChecks,
            hasRunActions: project.hasRunActions,
        }, projectConfig);
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
            if (project.keywords == null) {
                project.internal.keywords = [];
                continue;
            }

            let keywords = project.keywords.map(x => x);

            this.#addCustomKeywords(keywords, duplicateKeywords, countOfKeywords);

            project.internal.keywords = keywords;
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
