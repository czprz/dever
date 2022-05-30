import config_handler from './local-config.js';
import {Project} from '../common/models/internal.js';
import json from '../common/helper/json.js';

"use strict";
export default new class {
    /**
     * Any projects added
     * @return {boolean}
     */
    any() {
        return config_handler.get()?.projects.length > 0;
    }

    /**
     * Gets only one project by specifically looking through keywords found in .dever
     * @param keyword {string}
     * @returns Project | null
     */
    get(keyword) {
        let projects = this.#getProjects();
        if (projects == null) {
            return null;
        }

        const filteredProjects = projects.filter(x => x != null && x.keywords.includes(keyword));

        if (filteredProjects.length > 1) {
            console.error('Components are not allowed to share keywords. Please fix this.');
            return null;
        }

        return filteredProjects.length === 0 ? null : filteredProjects[0];
    }

    /**
     * Gets all projects from .dever
     * @returns {Project[] | null}
     */
    getAll() {
        const projects = this.#getProjects();
        if (projects == null) {
            return null;
        }

        return projects.filter(x => x != null);
    }

    /**
     * Removes all projects from .dever
     */
    clear() {
        const config = config_handler.get();

        config.projects = [];

        config_handler.write(config);
    }

    /**
     * Adds project to .dever
     * @param file {string}
     */
    add(file) {
        const config = config_handler.get();

        config.projects.push(file);

        config_handler.write(config);
    }

    /**
     * Removes project from .dever
     * @param file {string}
     */
    remove(file) {
        const config = config_handler.get();
        if (config == null) {
            return;
        }

        const index = config.projects.indexOf(x => x.path === file);
        if (index === -1) {
            return;
        }

        config.projects.splice(index, 1);

        config_handler.write(config);
    }

    /**
     * Gets all projects configuration
     * @returns {Project[] | null}
     */
    #getProjects() {
        const config = config_handler.get();
        if (config == null || config.projects == null || config.projects.length === 0) {
            return null;
        }

        return config.projects.map(x => json.read(x.path));
    }
}