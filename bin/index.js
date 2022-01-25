#! /usr/bin/env node

const defaultYargsGenerator = require('./common/default-yargs-generator');
const projectYargsGenerator = require('./common/project-yargs-generator');
const projectConfig = require('./configuration/handleComponents');

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

if (argv.length !== 0 && !['init', 'list', 'config'].some(x => x === argv[0])) {
    const keyword = argv[0];
    const config = projectConfig.getComponent(keyword);
    if (config !== null) {
        projectYargs(keyword, config);
        return;
    }

    argv = [];
    console.error(`Project could not be found. Please check if spelled correctly or run 'dever init'`);
}

defaultYargs();
