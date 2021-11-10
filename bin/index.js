#! /usr/bin/env node

const yargs = require("yargs")(process.argv.slice(2));

const env = require('./environments');
const install = require('./install');
const init = require('./init');

const usage = "\nUsage: dever <command> <option>";
yargs
    .usage(usage)
    .command('init', 'Initialize dever', yargs => {
        return yargs;
    }, argv => {
        init.init(argv);
    })
    .command('install', 'Install necessary dependencies for web and backend development', (yargs) => {
        return yargs
            .option('all', {
                describe: 'Flag for installing both backend and web development dependencies'
            })
            .option('web', {
                describe: 'Flag for only installing web development dependencies'
            })
            .option('backend', {
                describe: 'Flag for only installing backend development dependencies'
            });
    }, (argv) => {
        install.install(argv);
    })
    .command('env', 'Development Environment Helper')
    .command('env [component]', 'Development Environment Helper', (yargs) => {
        return env.builder(yargs, 0);
    }, (argv) => {
        env.handler(argv).catch(console.error);
    })
    .scriptName("dever");

if (yargs.argv._.length === 0) {
    yargs.showHelp();
}

// ideas
// 1. Add support for msmq with WPMC installed
// 2. Make install more flexible. Make user able to choose packages.
// 3. Best ways to store node.js cli config files to avoid it being cleared when upgraded
// 4. Support for creating configuration files for each component. Somehow through dever.json?
// 5. Add confirm to 'dever init' if components is not empty

// To be fixed
// Add npmjs & sgre registry to user .npmrc file (Cannot be done, due to this being necessary for installing dever. Should be added to README)
