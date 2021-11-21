module.exports = new class {
    /**
     * Handler for fixes
     * @param yargs {object}
     * @param args {Args}
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
     * @param args {Args}
     */
    #showFix(args) {
        // Todo: Missing implementation
    }

    /**
     * Show a list of problems which can be solved using 'fix [problem]'
     */
    #showListOfProblems() {
        // Todo: Missing implementation
    }
}