#! /usr/bin/env node

const yargs = require("yargs")(process.argv.slice(2));

const env = require('./environments');
const init = require('./init');
const fix = require('./fix');

yargs
    .usage('\nUsage: $0 <command> [keyword]')
    .command({
        command: 'init',
        desc: 'Initializes dever and searches for dever.json files',
        handler: (argv) => {
            init.init(argv).catch(console.error);
        }
    })
    .command('fix', 'Fix common possibly repeatable issues')
    .command({
        command: 'fix [problem]',
        desc: 'Fix common possibly repeatable issues',
        builder: (yargs) => fix.getOptions(yargs),
        handler: (argv) => {
            fix.handler(yargs, argv).catch(console.error);
        }
    })
    .command('env', 'Development environment organizer')
    .command({
        command: 'env [keyword]',
        desc: 'Development environment organizer',
        builder: (yargs) => env.getOptions(yargs),
        handler: (argv) => {
            env.handler(yargs, argv).catch(console.error);
        }
    })
    .scriptName("dever")
    .wrap(100);

if (yargs.argv._.length === 0) {
    yargs.showHelp();
}