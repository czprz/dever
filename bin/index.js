#! /usr/bin/env node

import defaultYargsGenerator from './common/default-yargs-generator.js';
import projectYargsGenerator from './common/project-yargs-generator.js';
import projectConfigFacade from "./configuration/facades/project-config-facade.js";

import constants from './common/constants.js';

import yargs from 'yargs';

class EntryPoint {
    #argv;

    constructor() {
        this.#argv = process.argv.slice(2);
    }

    start() {
        if (this.#argv.length !== 0 && !constants.notAllowedKeywords.some(x => x === this.#argv[0])) {
            const keyword = this.#argv[0];
            const project = projectConfigFacade.get(keyword);

            if (project !== null) {
                if (!project.supported) {
                    console.error(`dever does not support this projects dever.json version`);
                    console.error(`Please install version of '@czprz/dever' which supports the dever.json version`);
                    return;
                }

                if (!project.validSchema) {
                    console.error(`"${project.location}" - schema check against project configuration file. Found it to be invalid.`);
                    console.error(`The project configuration file must be fixed. If the project is to used again.`);
                    console.error(`Use 'dever validate -f "${project.location}"' to figure out what could be wrong`);
                    return;
                }

                if (!project.validKeywords) {
                    console.error(`'${project.name}' is using not allowed keywords. This must be corrected if the project is to be used again'`);
                    console.error(`Use 'dever validate -f "${project.location}"' to figure out which keywords is not allowed`);
                    return;
                }

                EntryPoint.#projectYargs(keyword, project);
                return;
            }

            this.#argv = [];
            console.error(`Project could not be found. Please check if spelled correctly or run 'dever init'`);
        }

        this.#defaultYargs();
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
}

new EntryPoint().start();