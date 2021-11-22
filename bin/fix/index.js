const fix_config = require('../configuration/handleFixConfig');

module.exports = new class {
    /**
     * Handler for fixes
     * @param yargs {object}
     * @param args {FixArgs}
     * @returns {Promise<void>}
     */
    async handler(yargs, args) {
        // Todo: Missing handling of fixes

        switch (true) {
            case args.list:
                this.#showListOfProblems();
                break;
            case args.show:
                this.#showFix(args);
                break;
            default:
                this.#showHelp(yargs);
        }
    }

    /**
     * Generate default or component options
     * @param yargs {object}
     * @returns {*|Object}
     */
    getOptions(yargs) {
        const keyword = this.#getKeywordFromArgv(yargs.argv);
        return keyword == null ?
            this.#optionsWithoutComponent(yargs) :
            this.#optionsWithComponent(yargs, keyword);
    }

    /**
     * Show help context menu when called
     * @param yargs
     * @return void
     */
    #showHelp(yargs) {
        yargs.showHelp();
    }

    /**
     * Get all options without component
     * @param yargs {object}
     * @returns {object}
     */
    #optionsWithoutComponent(yargs) {
        return yargs
            .positional('problem', {
                describe: 'Name of problem that you would like to fix that is listed in dever.json',
                type: 'string'
            })
            .option('list', {
                alias: 'l',
                describe: 'List of all problems which is supported',
            });
    }

    /**
     * Get all component options
     * @param yargs {object}
     * @param keyword {string}
     * @returns {object}
     */
    #optionsWithComponent(yargs, keyword) {
        return yargs
            .option('show', {
                alias: 's',
                describe: `Shows what 'fix [problem]' will execute`,
            });
    }

    /**
     * Get keyword from yargs
     * @param argv {object}
     * @returns {null|*}
     */
    #getKeywordFromArgv(argv) {
        if (argv.length < 2) {
            return null;
        }

        return argv._[1];
    }

    /**
     * Show in console what the 'fix [problem]' will execute
     * @param args {FixArgs}
     */
    #showFix(args) {
        const fixes = fix_config.get(args.problem);
        if (fixes == null) {
            console.log(`fix could not be found`);
            return;
        }

        for (const fix of fixes) {
            switch(fix.type) {
                case "powershell-command":
                case "powershell-script":
                    console.log(`${fix.type}: ${fix.command}`);
                    break;
                default:
                    console.error('fix type not supported');
            }
        }
    }

    /**
     * Show a list of problems which can be solved using 'fix [problem]'
     */
    #showListOfProblems() {
        const fixes = fix_config.getAll();
        if (fixes == null) {
            console.log(`no 'fix' commands available in any dever.json`);
            return;
        }

        for (const fix of fixes) {
            console.log(fix.key);
        }
    }
}