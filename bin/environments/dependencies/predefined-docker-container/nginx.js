module.exports = {
    start: start,
    stop: stop
}

const container_name = "fake-nginx";
const docker_image = "artifactory.pte.sgre.one/docker-local/ac/fake-nginx";

const shell = require('../../../common/helper/shell');
const docker = require('../../../common/helper/docker');

function run() {
    shell.executeSync(`docker run -d --name ${container_name} -p 443:443 ${docker_image}`);
}

function start(args) {
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
        case docker.states.Running: {
            if (recreate(args.clean)) {
                return;
            }

            console.log(`predefined-docker-container: '${container_name}' already running!`);
            break;
        }
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
        ports: ['443:443'],
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
