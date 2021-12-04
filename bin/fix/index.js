const fix_config = require('../configuration/handleFixConfig');
const powershell = require('../common/helper/powershell');

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
                this.#showHelpOrFix(yargs, args);
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
            switch (fix.type) {
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

    /**
     * Fix or show help depending on whether 'problem' is defined or not
     * @param yargs {object}
     * @param args {FixArgs}
     */
    #showHelpOrFix(yargs, args) {
        if (args.problem != null) {
            this.#fix(args.problem);
            return;
        }

        this.#showHelp(yargs);
    }

    /**
     * Fix problem
     * @param problem {string}
     */
    #fix(problem) {
        const fix = fix_config.get(problem)[0];

        // Todo: support listing of all fix's with same key together with their type and command/file. With a number which user can input and then it'll run that fix

        switch (fix.type) {
            case 'powershell-command':
                powershell.executeSync(fix.command);
                console.log(`fix: '${fix.key}' powershell-command has been executed.`);
                break;
            case 'powershell-script':
                powershell.executeFileSync(fix.file);
                console.log(`fix: '${fix.key}' powershell-script has been executed.`);
                break;
            default:
                throw new Error('Fix type not supported');
        }
    }
}

class FixArgs {
    /**
     * Defined which 'problem' fix should solve
     * @return {string}
     */
    problem;

    /**
     * Show command/file that will be executed when running 'fix [problem]' command
     * @return {boolean}
     */
    show;

    /**
     * Show list of possible fixes
     * @var {bool}
     */
    list;
}