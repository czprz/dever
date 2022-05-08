import install from '../install/index.js';
import env from '../environments/index.js';
import fix from '../fix/index.js';

import chalk from 'chalk';

"use strict";
export default new class {
    /**
     * Get yargs structure for project
     * @param keyword {string}
     * @param config {Config}
     * @param yargs {object}
     * @return void
     */
    create(keyword, config, yargs) {
        this.#createInstall(keyword, config, yargs);
        this.#createEnvironment(keyword, config, yargs);
        this.#createFix(keyword, config, yargs);

        yargs
            .command({
                command: 'config',
                desc: 'Show content of project configuration file',
                builder: (yargs) => {
                    yargs
                        .option('l', {
                            alias: 'location',
                            describe: 'Show location of project configuration file'
                        });
                },
                handler: (argv) => {
                    switch (true) {
                        case argv.location:
                            this.#showConfigLocation(config);
                            break;
                        default:
                            this.#showConfig(config);
                    }
                }
            });
    }

    /**
     * Run show help for default
     * @param yargs {object}
     */
    defaultAction(yargs) {
        if (yargs.argv._.length === 0) {
            yargs.showHelp();
        }
    }

    /**
     * Create commands for install section
     * @param keyword {string}
     * @param config {Config}
     * @param yargs
     */
    #createInstall(keyword, config, yargs) {
        if (config.install == null) {
            return;
        }

        yargs
            .command({
                command: `install`,
                desc: 'Install project depended packages and functionality',
                builder: (yargs) => install.getOptions(yargs),
                handler: (argv) => {
                    install.handler(config, yargs, argv).catch(console.error);
                }
            });
    }

    /**
     * Create commands for environment section
     * @param keyword {string}
     * @param config {Config}
     * @param yargs
     */
    #createEnvironment(keyword, config, yargs) {
        if (config.environment == null) {
            return;
        }

        yargs
            .command({
                command: 'env',
                desc: 'Development environment organizer',
                builder: (yargs) => env.getOptions(yargs, config),
                handler: (argv) => {
                    env.handler(config, yargs, argv).catch(console.error);
                }
            });
    }

    /**
     * Create commands for fix section
     * @param keyword {string}
     * @param config {Config}
     * @param yargs
     */
    #createFix(keyword, config, yargs) {
        if (config.fix == null) {
            return;
        }

        yargs
            .command({
                command: 'fix [key]',
                desc: 'Fix common possibly repeatable issues',
                builder: (yargs) => fix.getOptions(yargs),
                handler: (argv) => {
                    fix.handler(config, yargs, argv).catch(console.error);
                }
            })
    }

    /**
     * Show location of project configuration file
     * @param config {Config}
     */
    #showConfigLocation(config) {
        if (config == null) {
            console.error(chalk.redBright('Could not find project'));
            return;
        }

        console.log(config.location);
    }

    /**
     * Show content of project configuration file
     * @param config {Config}
     */
    #showConfig(config) {
        if (config == null) {
            console.error(chalk.redBright('Could not find project'));
            return;
        }

        console.log(config);
    }
}