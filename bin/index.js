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
        return env.getOptions(yargs);
    }, (argv) => {
        env.handler(yargs, argv).catch(console.error);
    })
    .scriptName("dever");

if (yargs.argv._.length === 0) {
    yargs.showHelp();
}