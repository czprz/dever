module.exports = {
    install: oldInstall
};

const shell = require('./common/helper/shell');
const powershell = require('./common/helper/powershell');

/**
 * Installs tools related to web or backend development
 * @param args
 */
function oldInstall(args) {
    if (!args.all && !args.web && !args.backend) {
        console.error("Missing flag. Must have one of either --all, --web or --backend flag");
        return;
    }

    install_chocolatey();

    // Todo: Add support for elevating permissions for installing choco packages

    switch(true) {
        case args.all: {
            must_have();
            backend_only();
            web_only();
            successful_install_msg('web and backend');
            break;
        }
        case args.web: {
            must_have();
            web_only();
            successful_install_msg('Web');
            break;
        }
        case args.backend: {
            must_have();
            backend_only();
            successful_install_msg('backend');
            break;
        }
        default: {
            console.error('Option not supported');
        }
    }
}

function successful_install_msg(flag) {
    console.log(`Installation of '${flag}' tools successfully installed`);
}

function install_chocolatey() {
    if (is_chocolatey_installed()) {
        return;
    }

    powershell.executeSync("Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))");
}

function must_have() {
    // Must run these commands from elevated shell

    shell.executeSync('choco install git -y');
    shell.executeSync('choco install smartgit -y');
    shell.executeSync('choco install sql-server-management-studio -y');
    shell.executeSync('choco install mremoteng -y');
    shell.executeSync('choco install nuget.commandline -y');
}

function backend_only() {
    // Must run these commands from elevated shell
    shell.executeSync('choco install visualstudio2019enterprise -y');
}

function web_only() {
    // Must run these commands from elevated shell
    shell.executeSync('choco install webstorm -y');
    shell.executeSync('choco install vscode -y');
    shell.executeSync('choco install docker-desktop -y');
    shell.executeSync('choco install firefox -y');
}

function is_chocolatey_installed() {
    try {
        shell.executeSync('choco -v');
        return true;
    }
    catch {
        return false;
    }
}