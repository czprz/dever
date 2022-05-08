#! /usr/bin/env node

// import defaultYargsGenerator from './common/default-yargs-generator';
// import projectYargsGenerator from './common/project-yargs-generator';
import versionChecker from './common/helper/version-checker.js';
import projectConfig from './configuration/projects-config.js';
import constants from './common/constants.js';
import yargs from 'yargs';

let argv = process.argv.slice(2);

class EntryPoint {
    start() {
        if (argv.length !== 0 && !constants.notAllowedKeywords.some(x => x === argv[0])) {
            const keyword = argv[0];
            const config = projectConfig.get(keyword);

            if (config !== null) {
                if (!versionChecker.supported(config)) {
                    console.error(`dever does not support this projects dever.json version`);
                    console.error(`Please install version of '@czprz/dever' which supports the dever.json version`);
                    return;
                }

                EntryPoint.#projectYargs(keyword, config);
                return;
            }

            argv = [];
            console.error(`Project could not be found. Please check if spelled correctly or run 'dever init'`);
        }

        EntryPoint.#defaultYargs();
    }

    static #defaultYargs() {
        const field = yargs(argv);
        field
            .scriptName("dever")
            .wrap(100)
            .usage('\nUsage: $0 [keyword] <cmd>');

        // defaultYargsGenerator.create(yargs);
        // defaultYargsGenerator.defaultAction(yargs);
    }

    static #projectYargs(keyword, config) {
        const field = yargs(process.argv.slice(3));
        field
            .scriptName("dever " + keyword)
            .wrap(100)
            .usage('\nUsage: $0 <cmd> [args]');

        // projectYargsGenerator.create(keyword, config, field);
        // projectYargsGenerator.defaultAction(field);
    }
}

new EntryPoint().start();