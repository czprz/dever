const projectConfig = require('../configuration/handleComponents');

const install = require("../install");
const fix = require("../fix");
const env = require("../environments");

module.exports = new class {
    get(yargs) {
        yargs
            .command({
                command: '$0',
                desc: 'install, fix or run project environment from here. Using one of the project keywords',
                builder: (yargs) => this.#options(yargs),
                handler: (argv) => {
                    this.#run(yargs, argv);
                }
            })
            .option('list', {
                alias: 'l',
                describe: 'List all available projects found by running dever init',
            });
    }

    #run(yargs, argv) {
        if (argv.list) {
            this.#list();
            return;
        }

        const keyword = this.#getKeywordFromArgv(argv);
        if (keyword != null) {
            this.#choose(keyword, argv);
            return;
        }

        yargs.showHelp();
    }

    #options(yargs) {
        const keyword = this.#getKeywordFromArgv(yargs.argv);
        if (keyword == null) {
            // Todo: check if this can occur
            return;
        }

        const config = projectConfig.getComponent(keyword);
        if (config == null) {
            return;
        }

        this.#createInstall(config, yargs);
        this.#createEnvironment(config, yargs);
        this.#createFix(config, yargs);
    }

    #choose(keyword, argv) {
        const section = this.#getSectionFromArgv(argv).toLowerCase();
        switch (section) {
            case 'install':
                console.log('install');
                break;
            case 'env':
                console.log('env');
                break;
            case 'fix':
                console.log('fix');
                break;
            default:
                console.log('did not hit');
                console.log(argv);
        }
    }

    #list() {
        const projects = projectConfig.getAllComponents();

        for (const project of projects) {
            console.log();
            console.log('Name: ' + project.name);
            console.log('Keywords: ' + project.keywords.join(', '));
        }
    }

    /**
     * Create commands for install section
     * @param config {Config}
     * @param yargs
     */
    #createInstall(config, yargs) {
        if (config.install == null) {
            return;
        }

        yargs
            .command('[keyword] install', 'Install project depended packages and functionality')
            .command({
                command: '[keyword] install',
                desc: 'Install project depended packages and functionality',
                builder: (yargs) => install.getOptions(yargs),
                handler: (argv) => {
                    install.handler(yargs, argv).catch(console.error);
                }
            });
    }

    /**
     * Create commands for environment section
     * @param config {Config}
     * @param yargs
     */
    #createEnvironment(config, yargs) {
        if (config.dependencies == null) {
            return;
        }

        yargs
            .command('env', 'Development environment organizer')
            .command({
                command: 'env [keyword]',
                desc: 'Development environment organizer',
                builder: (yargs) => env.getOptions(yargs),
                handler: (argv) => {
                    env.handler(yargs, argv).catch(console.error);
                }
            })
    }

    /**
     * Create commands for fix section
     * @param config {Config}
     * @param yargs
     */
    #createFix(config, yargs) {
        if (yargs)
            yargs
                .command('fix', 'Fix common possibly repeatable issues')
                .command({
                    command: 'fix [keyword]',
                    desc: 'Fix common possibly repeatable issues',
                    builder: (yargs) => fix.getOptions(yargs),
                    handler: (argv) => {
                        fix.handler(yargs, argv).catch(console.error);
                    }
                })
    }

    /**
     * Get keyword from yargs
     * @param argv {object}
     * @returns {null|*}
     */
    #getKeywordFromArgv(argv) {
        if (argv.length < 1) {
            return null;
        }

        return argv._[0];
    }

    /**
     * Get section from yargs
     * @param argv {object}
     * @returns {null|*}
     */
    #getSectionFromArgv(argv) {
        if (argv.length < 2) {
            return null;
        }

        return argv._[1];
    }
}