const docker = require('../../../common/helper/docker');

module.exports = new class {
    /**
     * Handle starting and stopping of docker containers
     * @param dependency {Execution}
     * @param runtime {Runtime}
     */
    handle(dependency, runtime) {
        switch(true) {
            case runtime.start:
                this.#start(dependency.container, runtime);
                break;
            case runtime.stop:
                this.#stop(dependency.container);
                break;
        }
    }

    /**
     * Check if docker-container dependencies are available
     * @returns {boolean}
     */
    check() {
        if (!docker.is_docker_running()) {
            console.error(`Docker engine not running. Please start docker and retry command`);
            return false;
        }

        return true;
    }

    /**
     * Start docker container
     * @param container {Container}
     * @param runtime {Runtime}
     */
    #start(container, runtime) {
        const state = docker.container.getRunState(container.name);
        switch (state) {
            case docker.states.NotRunning: {
                if (this.#recreate(container, runtime.clean)) {
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
    #recreate(container, clean) {
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
    #stop(container) {
        docker.container.stop(container.name);
    }
}









