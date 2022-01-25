const chalk = require('chalk');

const powershell = require('../common/helper/powershell');

module.exports = new class {
    /**
     * Handler for fixes
     * @param config {Config}
     * @param yargs {object}
     * @param args {FixArgs}
     * @returns {Promise<void>}
     */
    async handler(config, yargs, args) {
        switch (true) {
            case args.list:
                this.#showList(config);
                break;
            case args.show != null:
                this.#showFix(config, args);
                break;
            case args.key != null:
                this.#fix(config, args);
                break;
            default:
                yargs.showHelp();
        }
    }

    /**
     * Generate default or component options
     * @param config {Config}
     * @param yargs {object}
     * @returns {*|Object}
     */
    getOptions(config, yargs) {
        return yargs
            .positional('[key]', {
                describe: 'Name of fix available for execution for project',
                type: 'string'
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
     * Show in console what the 'fix [problem]' will execute
     * @param config {Config}
     * @param args {FixArgs}
     */
    #showFix(config, args) {
        if (args.key == null) {
            console.error('Missing [key] for finding fix');
            return;
        }

        const fix = config?.fix.find(x => x.key === args.key);
        if (fix == null) {
            console.log(`Fix could not be found`);
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
     * @param config {Config}
     */
    #showList(config) {
        if (config == null) {
            console.log(chalk.redBright('Could not find any project with given keyword'));
            return;
        }

        for (const fix of config.fix) {
            console.log();
            console.log('key: ' + chalk.blue(fix.key));
            console.log(chalk.green(`${fix.type}: ${fix.command}`));
        }
    }

    /**
     * Fix problem
     * @param config {Config}
     * @param args {FixArgs}
     */
    #fix(config, args) {
        const fix = config?.fix.find(x => x.key === args.key);
        if (fix == null) {
            console.error('Fix could not be found');
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
}

class FixArgs {
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
    key;
}