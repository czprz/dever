#! /usr/bin/env node

import defaultYargsGenerator from './execution/default-yargs-generator.js';
import projectYargsGenerator from './execution/project-yargs-generator.js';
import projectConfigFacade from "./configuration/facades/project-config-facade.js";

import versionChecker from './common/version-checker/index.js';

import constants from './common/constants.js';

import enquirer from 'enquirer';

import yargs from 'yargs';
import Migrator from "./migrator/index.js";

class EntryPoint {
    #argv;

    constructor() {
        this.#argv = process.argv.slice(2);
    }

    start() {
        if (!Migrator.migrate()) {
            return;
        }

        if (this.#argv.length === 0 || constants.notAllowedKeywords.some(x => x === this.#argv[0])) {
            this.#defaultYargs();
            return;
        }

        const keyword = this.#argv[0];
        const projects = projectConfigFacade.get(keyword)?.filter(x => x.validKeywords && x.supported && x.validSchema);
        if (projects.length === 0) {
            this.#argv = [];
            console.error(`Project could not be found. Please check 'dever list' whether project exist`);
            return;
        }

        if (projects.length === 1) {
            EntryPoint.#projectYargs(keyword, projects[0]);
            return;
        }

        const options = {
            type: 'autocomplete',
            name: 'project',
            message: 'Pick a project',
            limit: 10,
            choices: projects.map(x => this.mapChoices(x)),
        };

        enquirer
            .prompt(options)
            .then((answer) => {
                const checkedAnswer = EntryPoint.#getAnswer(answer);
                const project = projects.find(x => x.location.full === checkedAnswer);
                EntryPoint.#projectYargs(keyword, project);
            })
            .catch((_) => _);
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

    /**
     * Create project yargs
     * @param keyword {string}
     * @param project {Project}
     */
    static #projectYargs(keyword, project) {
        const yargsObj = yargs(process.argv.slice(3));
        yargsObj
            .scriptName("dever " + keyword)
            .wrap(100)
            .usage('\nUsage: $0 <cmd> [args]');

        projectYargsGenerator.create(keyword, project, yargsObj);
        projectYargsGenerator.defaultAction(yargsObj);
    }

    /**
     * Create enquirer choices
     * @param project {Project}
     * @returns {{name: string, hint: string, value: string}}
     */
    mapChoices(project) {
        return {name: project.name, hint: project.location.partial, value: project.location.full};
    }

    /**
     * Ensures proper answer
     * @param answer {null|object|{project: string}}
     * @returns {string}
     */
    static #getAnswer(answer) {
        if (answer == null) {
            throw new Error("Answer is null");
        }

        return answer.project;
    }
}

versionChecker.fetch();

new EntryPoint().start();

versionChecker.inform();