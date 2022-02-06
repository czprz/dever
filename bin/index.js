#! /usr/bin/env node

const defaultYargsGenerator = require('./common/default-yargs-generator');
const projectYargsGenerator = require('./common/project-yargs-generator');
const versionChecker = require('./common/helper/version-checker');
const projectConfig = require('./configuration/projects-config');

let argv = process.argv.slice(2);

function defaultYargs() {
    const yargs = require("yargs")(argv);
    yargs
        .scriptName("dever")
        .wrap(100)
        .usage('\nUsage: $0 [keyword] <cmd>');

    defaultYargsGenerator.create(yargs);
    defaultYargsGenerator.defaultAction(yargs);
}

function projectYargs(keyword, config) {
    const yargs = require("yargs")(process.argv.slice(3));
    yargs
        .scriptName("dever " + keyword)
        .wrap(100)
        .usage('\nUsage: $0 <cmd> [args]');

    projectYargsGenerator.create(keyword, config, yargs);
    projectYargsGenerator.defaultAction(yargs);
}

if (argv.length !== 0 && !['init', 'list', 'config', '--help', '--version'].some(x => x === argv[0])) {
    const keyword = argv[0];
    const config = projectConfig.get(keyword);

    if (config !== null) {
        if (!versionChecker.supported(config)) {
            console.error(`dever does not support this projects dever.json version`);
            console.error(`Please install version of '@czprz/dever' which supports the dever.json version`);
            return;
        }

        projectYargs(keyword, config);
        return;
    }

    argv = [];
    console.error(`Project could not be found. Please check if spelled correctly or run 'dever init'`);
}

defaultYargs();
