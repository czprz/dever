#! /usr/bin/env node

const yargsGenerator = require("./common/yargs-generator");
const projectConfig = require('./configuration/handleComponents');
const argv = process.argv.slice(2);

function getSection(argv) {
    if (argv == null) {
        return null;
    }



    if (argv.length === 0) {
        return 'default';
    }
}

function defaultYargs() {
    const yargs = require("yargs")(argv);
    yargs
        .config({keyword: 'test'});

    yargs
        .scriptName("dever")
        .wrap(100)
        .usage('\nUsage: $0 [keyword] <command>');

    yargsGenerator.default(yargs);
    yargsGenerator.defaultAction(yargs);
}

function projectYargs(keyword, config) {
    const yargs = require("yargs")(process.argv.slice(3));
    yargs
        .scriptName("dever " + keyword)
        .wrap(100)
        .usage('\nUsage: $0 <command>');

    yargsGenerator.project(keyword, config, yargs);
    yargsGenerator.defaultAction(yargs);
}


if (argv.length !== 0 && argv.some(x => !['init', '-l'].includes(x))) {
    const keyword = argv[0];
    const config = projectConfig.getComponent(keyword);
    if (config !== null) {
        projectYargs(keyword, config);
    }
}

defaultYargs();
