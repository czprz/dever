#! /usr/bin/env node

const yargs = require("yargs")(process.argv.slice(2));

const env = require('./environments');
const init = require('./init');
const fix = require('./fix');
const install = require('./install');

const yargsGenerator = require('./common/yargs-generator');

yargs
    .usage('\nUsage: $0 [keyword] <command>')
    .command({
        command: 'init',
        desc: 'Initializes dever and searches for dever.json files',
        handler: (argv) => {
            init.init(argv).catch(console.error);
        }
    });

yargsGenerator.get(yargs);

yargs
    .scriptName("dever")
    .wrap(100)
    .parse();