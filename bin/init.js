module.exports = {
    init: init
}

const powershell = require('./common/helper/powershell');
const componentHandler = require('./configuration/handleComponents');

const path = require("path");
const fs = require("fs");

function getConfigFiles(filePath) {
    const file = filePath.trim();

    if (!file) {
        return;
    }

    if ('dever.json' !== path.basename(file)) {
        return;
    }

    componentHandler.addComponent(file);
}

function init(args) {
    const file = path.join(path.dirname(fs.realpathSync(__filename)), 'common/find_all_dever_json_files.ps1');

    componentHandler.clearComponents();

    const raw = powershell.executeFileSync(file);
    const paths  = raw.trim().split('\n');

    for (const path of paths) {
        getConfigFiles(path);
    }
}
