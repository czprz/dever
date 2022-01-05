const chalk = require('chalk');

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
        switch (true) {
            case args.list:
                this.#showList(args);
                break;
            case args.show != null:
                this.#showFix(args);
                break;
            case args.fix != null:
                this.#fix(args);
                break;
            default:
                yargs.showHelp();
        }
    }

    /**
     * Generate default or component options
     * @param yargs {object}
     * @returns {*|Object}
     */
    getOptions(yargs) {
        const keyword = this.#getKeywordFromArgv(yargs.argv);
        // Todo: How to handle .argv causing javascript execution not being able to continue when using --help
        return keyword == null ?
            this.#optionsWithoutKeyword(yargs) :
            this.#optionsWithKeyword(yargs, keyword);
    }

    /**
     * Get all options without component
     * @param yargs {object}
     * @returns {object}
     */
    #optionsWithoutKeyword(yargs) {
        return yargs
            .positional('keyword', {
                describe: 'One of the defined project keywords',
                type: 'string'
            })
            .option('list', {
                alias: 'l',
                describe: 'List all projects which has an available fixes',
            });
    }

    /**
     * Get all component options
     * @param yargs {object}
     * @param keyword {string}
     * @returns {object}
     */
    #optionsWithKeyword(yargs, keyword) {
        return yargs
            .option('fix', {
                alias: 'f',
                describe: 'Name of fix you want to execute'
            })
            .option('show', {
                alias: 's',
                describe: `Instead of executing fix it'll show what it will do`,
            })
            .option('list', {
                alias: 'l',
                describe: 'List all available fixes for project'
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
        const fix = fix_config.getFix(args.keyword, args.show);
        if (fix == null) {
            console.log(`Could not find project or fix.`);
            return;
        }

        switch (fix.type) {
            case "powershell-command":
            case "powershell-script":
                console.log(chalk.blue(fix.type + ':') + ' ' + chalk.green(fix.command));
                break;
            default:
                console.error('fix type not supported');
        }
    }

    /**
     * Show a list of problems which can be solved using 'fix [problem]'
     * @param args {FixArgs}
     */
    #showList(args) {
        if (args.keyword == null) {
            this.#listProjectsWithFixes();
            return;
        }

        this.#listAllProjectFixes(args.keyword);
    }

    /**
     * Fix problem
     * @param args {FixArgs}
     */
    #fix(args) {
        const fix = fix_config.getFix(args.keyword, args.fix);
        if (fix == null) {
            console.error('Could not find project or fix');
            return;
        }

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

    #listProjectsWithFixes() {
        const projects = fix_config.getAllProjectsWithFix();
        if (projects == null) {
            console.log(`no projects available with fix section`);
            return;
        }

        console.log('Projects which has fixes available.');

        for (const project of projects) {
            console.log();
            console.log(chalk.blue('Project: ') + chalk.green(project.name));
            console.log(chalk.blue('Keywords: ') + chalk.green(project.keywords.join(', ')));
        }
    }

    /**
     * List all project fixes
     * @param keyword {string}
     */
    #listAllProjectFixes(keyword) {
        const project = fix_config.getProjectWithFixes(keyword);
        if (project == null) {
            console.log(chalk.redBright('Could not find any project with given keyword'));
            return;
        }

        for (const fix of project.fix) {
            this.#showFixInConsole(fix, project.name);
        }
    }

    /**
     * Show fix in the console
     * @param fix {Fix}
     * @param projectName {string}
     */
    #showFixInConsole(fix, projectName) {
        console.log();
        console.log(chalk.blue(`'${fix.key}' from ${projectName}`));
        console.log(chalk.green(`${fix.type}: ${fix.command}`));
    }
}

class FixArgs {
    /**
     * Unique project keyword
     * @return {string}
     */
    keyword;

    /**
     * Show command/file that will be executed when running 'fix [problem]' command
     * @return {string}
     */
    show;

    /**
     * Show list of possible fixes
     * @return {boolean}
     */
    list;

    /**
     * Name of fix to be executed
     * @return {string}
     */
    fix;
}