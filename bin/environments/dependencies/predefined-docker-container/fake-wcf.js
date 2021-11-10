module.exports = {
    start: start,
    stop: stop
};

async function start(args) {
    await isRunning('SGRE.AC.Fake.Host').then((v) => console.log(v))
    //execute('Stop-Process -Name "SGRE.AC.Fake.Host"');
    //execute(`git clone https://gitlab.prod.sgre.one/wp-ac/brande/tools/fake-wcf.git D:\git`);
    //execute('dotnet publish D:\git\fake-wcf\fake.host\Fake.Host.csproj -o D:\git\fake-wcf\publish')
    //execute('Start-Process -FilePath "D:\git\fake-wcf\publish\SGRE.AC.Fake.Host.exe"');
}

async function stop() {
    await isRunning('SGRE.AC.Fake.Host').then((v) => {
        if (v) {
            console.log('stopped');
        }
    })
}

function is_running()
{
    
}

const exec = require('child_process').exec

function isRunning(win, mac, linux){
    return new Promise(function(resolve, reject){
        const plat = process.platform
        const cmd = plat == 'win32' ? 'tasklist' : (plat == 'darwin' ? 'ps -ax | grep ' + mac : (plat == 'linux' ? 'ps -A' : ''))
        const proc = plat == 'win32' ? win + '.exe' : (plat == 'darwin' ? mac : (plat == 'linux' ? linux : ''))
        if (cmd === '' || proc === ''){
            resolve(false)
        }
        exec(cmd, function(err, stdout, stderr) {
            resolve(stdout.toLowerCase().indexOf(proc.toLowerCase()) > -1)
        })
    })
}