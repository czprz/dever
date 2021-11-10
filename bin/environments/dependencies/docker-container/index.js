module.exports = {
    handle: handle
}

const docker = require('../../../common/helper/docker');

/**
 * Handle starting and stopping of docker containers
 * @param dependency {Dependency}
 * @param args {Args}
 */
function handle(dependency, args) {
    switch(true) {
        case args.start:
            start(dependency.container, args);
            break;
        case args.stop:
            stop(dependency.container);
            break;
    }
}

/**
 * Start docker container
 * @param container {Container}
 * @param args {Args}
 */
function start(container, args) {
    const state = docker.container.getRunState(container.name);
    switch (state) {
        case docker.states.NotRunning: {
            if (recreate(container, args.clean)) {
                return;
            }

            docker.container.start(container.name);

            console.log(`docker-container: '${container.name}' has been started!`);

            break;
        }
        case docker.states.Running:
            console.log(`docker-container: '${container.name}' already running!`);
            break;
        case docker.states.NotFound:
            docker.container.create(container);
            console.log(`docker-container: '${container.name}' has been created and started!`);
            break;
    }
}

/**
 * Recreated docker container
 * @param container {Container}
 * @param clean {boolean}
 */
function recreate(container, clean) {
    if (!clean) {
        return false;
    }

    docker.container.remove(container.name);
    docker.container.create(container);
    console.log(`docker-container: '${container.name}' has been recreated!`);

    return true;
}


/**
 * Stop docker container
 * @param container {Container}
 */
function stop(container) {
    docker.container.stop(container.name);
}

