const config = require('../configuration/handleInstallConfig');

module.exports = new class {
    /**
     * Handler for fixes
     * @param yargs {object}
     * @param args {InstallArgs}
     * @returns {Promise<void>}
     */
    async handler(yargs, args) {
        switch (true) {
            case args.listGroups:
                this.#listGroups(args);
                break;
            default:
                yargs.showHelp();
        }
    }

    /**
     * Generate default or project options
     * @param yargs {object}
     * @returns {*|Object}
     */
    getOptions(yargs) {
        const keyword = this.#getKeywordFromArgv(yargs.argv);
        return keyword == null ?
            this.#getOptionsWithoutKeyword(yargs) :
            this.#getOptionsWithKeyword(yargs, keyword);
    }

    /**
     * Show all groups and what they will install
     * @param args {InstallArgs}
     */
    #listGroups(args) {
        const installs = config.get(args.keyword);
        if (installs == null) {
            console.error('Project could not be found');
            return;
        }

        const sorted = installs.sort(x => x.group);
        let prevGroup = null;

        for (const install of sorted) {
            if (prevGroup !== install.group) {
                console.log();
                console.log(`--- ${install.group} ---`);
                prevGroup = install.group;
            }

            switch(install.type) {
                case 'chocolatey': {
                    console.log(`Type: Chocolatey, Package: ${install.package}`);
                    break;
                }
                default:
                    throw new Error('Install type not supported');
            }
        }
    }

    /**
     * Get all options without project
     * @param yargs {object}
     * @returns {object}
     */
    #getOptionsWithoutKeyword(yargs) {
        return yargs
            .positional('keyword', {
                describe: 'One of the defined project keywords',
                type: 'string'
            })
            .option('list', {
                alias: 'l',
                describe: 'List all currently known projects which has install section defined in dever.json',
            });
    }

    /**
     * Get all project install options
     * @param yargs {object}
     * @param keyword {string}
     * @returns {object}
     */
    #getOptionsWithKeyword(yargs, keyword) {
        return yargs
            .option('list', {
                alias: 'l',
                describe: `List all options under install section in the projects dever.json`,
            })
            .option('list-groups', {
                alias: 'g',
                describe: 'List of all installation groups under install section in the projects dever.json'
            })
            .option('list-group', {
                alias: 'lg',
                describe: 'List of all installs underneath a specific group in the projects dever.json'
            })
            .option('group', {
                alias: 'ig',
                describe: 'Install all items underneath a specific group in the projects dever.json'
            })
            .option('only', {
                alias: 'o',
                describe: 'Install only specific package'
            })
            .option('no-before-after', {
                alias: 'nbf',
                describe: 'Disables running of before and after functionality if defined in project dever.json'
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
}

class InstallArgs {
    /**
     * Unique project keyword
     * @return {string}
     */
    keyword;

    /**
     * Show list of possible fixes
     * @return {boolean}
     */
    list;

    /**
     * List all groups and which items is underneath each group
     * @return {boolean}
     */
    listGroups;

    /**
     * List all install items underneath specific group name
     * @return {string}
     */
    listGroup;

    /**
     * Install all items with specific group name
     * @return {string}
     */
    group;

    /**
     * Only install specifically defined package/item
     * @return {string}
     */
    only;

    /**
     * Do not run before or after if defined in dever.json install section
     * @return {boolean}
     */
    noBeforeAfter;
}