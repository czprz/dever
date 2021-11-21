#! /usr/bin/env node

const yargs = require("yargs")(process.argv.slice(2));

const env = require('./environments');
const install = require('./install');
const init = require('./init');
const fix = require('./fix');

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
    .command('fix', 'Fix common possibly repeatable issues')
    .command('fix [problem]', 'Fix common possibly repeatable issues', (yargs) => {
        return fix.getOptions(yargs);
    }, (argv) => {
        fix.handler(yargs, argv).catch(console.error);
    })
    .command('env', 'Development environment organizer')
    .command('env [component]', 'Development environment organizer', (yargs) => {
        return env.getOptions(yargs);
    }, (argv) => {
        env.handler(yargs, argv).catch(console.error);
    })
    .scriptName("dever");

if (yargs.argv._.length === 0) {
    yargs.showHelp();
}