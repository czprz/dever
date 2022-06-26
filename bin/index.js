#! /usr/bin/env node

import defaultYargsGenerator from './common/default-yargs-generator.js';
import projectYargsGenerator from './common/project-yargs-generator.js';
import projectConfigFacade from "./configuration/facades/project-config-facade.js";

import constants from './common/constants.js';

import enquirer from 'enquirer';

import yargs from 'yargs';

class EntryPoint {
    #argv;

    constructor() {
        this.#argv = process.argv.slice(2);
    }

    start() {
        if (this.#argv.length === 0 || constants.notAllowedKeywords.some(x => this.#argv[0].startsWith(x))) {
            this.#defaultYargs();
            return;
        }

        const keyword = this.#argv[0];
        const projects = projectConfigFacade.get(keyword);
        if (projects == null || projects.length === 0) {
            this.#argv = [];
            console.error(`Project could not be found. Please check if spelled correctly or run 'dever init'`);
            return;
        }

        if (projects.length === 1) {
            EntryPoint.#projectYargs(keyword, projects[0]);
            return;
        }

        let choices = projects.map(x => this.create(x));
        const options = {
            type: 'autocomplete',
            name: 'project',
            message: 'Pick a project',
            limit: 10,
            initial: 1,
            choices: choices
        };

        enquirer.prompt(options).then(project => {
            EntryPoint.#projectYargs(keyword, project['project']);
        });
    }

    #defaultYargs() {
        const yargsObj = yargs(this.#argv);
        yargsObj
            .scriptName("dever")
            .wrap(100)
            .usage('\nUsage: $0 [keyword] <cmd>');

        defaultYargsGenerator.create(yargsObj);
        defaultYargsGenerator.defaultAction(yargsObj);
    }

    static #projectYargs(keyword, config) {
        const yargsObj = yargs(process.argv.slice(3));
        yargsObj
            .scriptName("dever " + keyword)
            .wrap(100)
            .usage('\nUsage: $0 <cmd> [args]');

        projectYargsGenerator.create(keyword, config, yargsObj);
        projectYargsGenerator.defaultAction(yargsObj);
    }

    /**
     * Create enquirer choices
     * @param project {Project}
     * @returns {{name: string}}
     */
    create(project) {
        return { name: `${project.name} - ${project.location}`, value: project };
    }
}

new EntryPoint().start();