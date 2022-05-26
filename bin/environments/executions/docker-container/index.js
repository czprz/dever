import docker from '../../../common/helper/docker/index.js';

"use strict";
export default new class {
    /**
     * Handle starting and stopping of docker containers
     * @param execution {Execution}
     * @param runtime {Runtime}
     */
    handle(execution, runtime) {
        switch(true) {
            case runtime.start:
                this.#start(execution.container, runtime);
                break;
            case runtime.stop:
                this.#stop(execution.container);
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
        console.log(`docker-container: '${container.name}' has been stopped!`);
        docker.container.stop(container.name);
    }
}









