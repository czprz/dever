module.exports = {
    start: handle,
    stop: stop
}

const container_name = "mssql";
const docker_image = "artifactory.pte.sgre.one/mcr.microsoft.com/mssql/server:2019-latest";

const docker = require('../../../common/helper/docker');

function handle(args) {
    const state = docker.container.getRunState(container_name);
    switch (state) {
        case docker.states.NotRunning: {
            if (recreate(args.clean)) {
                return;
            }

            docker.container.start(container_name);

            console.log(`predefined-docker-container: '${container_name}' has been started!`);

            break;
        }
        case docker.states.Running:
            if (recreate(args.clean)) {
                return;
            }

            console.log(`predefined-docker-container: '${container_name}' already running!`);
            break;
        case docker.states.NotFound:
            create();
            console.log(`predefined-docker-container: '${container_name}' has been created and started!`);
            break;
    }
}

/**
 * Create and start docker container
 */
function create() {
    docker.container.create({
        name: container_name,
        ports: ['1433:1433'],
        variables: ['ACCEPT_EULA=Y', 'SA_PASSWORD=123456789Qwerty'],
        image: docker_image
    });
}

/**
 * Recreated docker container
 * @param clean {boolean}
 */
function recreate(clean) {
    if (!clean) {
        return false;
    }

    docker.container.remove(container_name);
    create();
    console.log(`predefined-docker-container: '${container_name}' has been recreated!`);

    return true;
}

function stop() {
    docker.container.stop(container_name);
}
