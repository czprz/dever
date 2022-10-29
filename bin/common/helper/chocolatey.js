import powershell from "./powershell.js";
import sudo from "./elevated.js";
import delayer from "./delayer.js";
import readline from "readline";

export default new class {
    async install() {
        if (await sudo.isElevated()) {
            return false;
        }

        const timer = delayer.create();

        const rl = readline.createInterface(process.stdin, process.stdout);
        await rl.question('Are you sure you want to install Chocolatey? [yes]/no:', async (answer) => {
            if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
                try {
                    powershell.executeSync('Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString(\'https://community.chocolatey.org/install.ps1\'))')
                    timer.done(true);
                } catch (e) {
                    // TODO: Figure out how to pass exception for logging
                    timer.done(false);
                }
            } else {
                timer.done(false);
            }

            rl.close();
        });

        return timer.delay(36000000, false);
    }
}