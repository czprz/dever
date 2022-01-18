const projectConfig = require('../configuration/handleComponents');

const install = require("../install");
const fix = require("../fix");
const env = require("../environments");
const init = require("../init");

module.exports = new class {
    /**
     * Get yargs structure for default
     * @param yargs {object}
     * @return void
     */
    default(yargs) {
        yargs
            .command({
                command: 'init',
                desc: 'Initializes dever and searches for dever.json files',
                handler: (argv) => {
                    console.log('hit');
                    //init.init(argv).catch(console.error);
                }
            })
            .command({
                command: '[keyword]',
                desc: 'Project keyword',
                handler: (argv) => {
                    console.log('test');
                },
            })
            .option('list', {
                alias: 'l',
                describe: 'List all available projects found by running dever init',
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
     * Get yargs structure for project
     * @param keyword {string}
     * @param config {Config}
     * @param yargs {object}
     * @return void
     */
    project(keyword, config, yargs) {
        this.#createInstall(keyword, config, yargs);
        this.#createEnvironment(keyword, config, yargs);
        this.#createFix(keyword, config, yargs);
    }

    get(yargs) {
        yargs
            .command({
                command: ['$0'],
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
        console.log(argv);
        if (argv.list) {
            this.#list();
            return;
        }

        const keyword = this.#getKeywordFromArgv(argv);
        if (keyword != null) {
            this.#choose(keyword, yargs, argv);
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

    #choose(keyword, yargs, argv) {
        const section = this.#getSectionFromArgv(argv);
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
                yargs.showHelp();
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
                    install.handler(yargs, argv).catch(console.error);
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
        if (config.dependencies == null) {
            return;
        }

        yargs
            .command({
                command: 'env',
                desc: 'Development environment organizer',
                builder: (yargs) => env.getOptions(yargs),
                handler: (argv) => {
                    env.handler(yargs, argv).catch(console.error);
                }
            })
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
                    command: 'fix',
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
        if (argv._ == null || argv._.length < 2) {
            return null;
        }

        return argv._[1].toLowerCase();
    }
}