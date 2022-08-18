import powershell from '../../common/helper/powershell.js';
import logger from '../../common/helper/logger.js';

import chalk from 'chalk';
import path from 'path';

"use strict";
export default new class {
    /**
     * Handler for fixes
     * @param project {Project}
     * @param yargs {object}
     * @param args {FixArgs}
     * @returns {Promise<void>}
     */
    async handler(project, yargs, args) {
        switch (true) {
            case args.list:
                this.#showList(project);
                break;
            case args.show != null:
                this.#showFix(project, args);
                break;
            case args.key != null:
                await this.#fix(project, args);
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
            })
            .option('shc', {
                alias: 'skip-hash-check',
                describe: 'Skip hash check when running command'
            });
    }

    /**
     * Show in console what the 'fix [problem]' will execute
     * @param project {Project}
     * @param args {FixArgs}
     */
    #showFix(project, args) {
        if (args.key == null) {
            console.error('Missing [key] for finding fix');
            return;
        }

        const fix = project?.fix.find(x => x.key === args.key);
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
     * @param project {Project}
     */
    #showList(project) {
        if (project == null) {
            console.log(chalk.redBright('Could not find any project with given keyword'));
            return;
        }

        for (const fix of project.fix) {
            console.log();
            console.log('key: ' + chalk.blue(fix.key));
            console.log(chalk.green(`${fix.type}: ${fix.command}`));
        }
    }

    /**
     * Fix problem
     * @param project {Project}
     * @param args {FixArgs}
     */
    async #fix(project, args) {
        const fix = project?.fix.find(x => x.key === args.key);
        if (fix == null) {
            console.error('Fix could not be found');
            return;
        }

        logger.create();

        switch (fix.type) {
            case 'powershell-command':
                await this.#tryFix(fix.key, 'powershell-command', async () => await powershell.executeSync(fix.command));
                break;
            case 'powershell-script':
                // Todo: Check fix.file is a full path
                const file = path.join(project.location.partial, fix.file);
                await this.#tryFix(fix.key, 'powershell-script', async () => await powershell.executeFileSync(file));
                break;
            default:
                throw new Error('Fix type not supported');
        }

        logger.destroy();

        if (logger.hasLogs()) {
            console.log(chalk.yellow(`Fix command ended with errors. Please check the log for more detail. ${logger.getLogFile()}`));
        }
    }

    /**
     * Handles try/catch for fix commands
     * @param action {Function}
     * @param type {string}
     * @param key {string}
     * @return void
     */
    async #tryFix(key, type, action) {
        try {
            await action();
            console.log(`${type}: '${key}' completed successfully`);
        } catch (e) {
            logger.error(`${type}: '${key}' completed with errors`, e);
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