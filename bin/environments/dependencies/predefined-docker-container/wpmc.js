module.exports = {
    start: start,
    stop: stop
}

const container_name = "fake-wpmc";
const docker_image = "artifactory.pte.sgre.one/docker-local/ac/fake-wpmc";

const docker = require('../../../common/helper/docker');

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
        ports: ['30004:443'],
        variables: [
            'ASPNETCORE_ENVIRONMENT=Development',
            'ASPNETCORE_URLS="https://+:443"',
            'ASPNETCORE_Kestrel__Certificates__Default__Path=/https/cert.pfx',
            'ASPNETCORE_Kestrel__Certificates__Default__Password=19c699d2ef464aa077eaaafaec7f029dfdcb1f0e4e04ffcbc8b17572b3a3720c2f2147ced9ae42d064e58d55a5a62cbbe69c6d8a9f6c44b18a806e745d0c3e45'],
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
