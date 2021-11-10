module.exports = {
    start: handle,
    stop: stop
}

const container_name = "fake-inventory";
const docker_image = "artifactory.pte.sgre.one/docker-local/ac/fake-inventory";

const util = require('../../../common/helper/util');
const docker = require('../../../common/helper/docker');
const axios = require('axios');

async function handle(args) {
    const state = docker.container.getRunState(container_name);
    switch (state) {
        case docker.states.NotRunning: {
            if (await recreate(args)) {
                return;
            }

            docker.container.start(container_name);

            console.log(`predefined-docker-container: '${container_name}' has been started!`);

            await util.delay(3000);
            await add_inventory(args.turbines);

            break;
        }
        case docker.states.Running: {
            if (await recreate(args)) {
                return;
            }

            console.log(`predefined-docker-container: '${container_name}' already running!`);

            await util.delay(3000);
            await add_inventory(args.turbines);

            break;
        }
        case docker.states.NotFound: {
            create();

            console.log(`predefined-docker-container: '${container_name}' has been created and started!`);

            await util.delay(3000);
            await add_inventory(args.turbines);

            break;
        }
    }
}

/**
 * Create and start docker container
 */
function create() {
    docker.container.create({
        name: container_name,
        ports: ['10443:443'],
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
 * @param args {Args}
 */
async function recreate(args) {
    if (!args.clean) {
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

async function has_inventory(nOfTurbines) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    return await axios
        .get('https://localhost:10443/api/configuration/stations')
        .then(res => {
            if (res.status === 204) {
                return false;
            }

            return nOfTurbines == null && res.data.length > 0 || nOfTurbines === res.data.length;
        })
        .catch(() => {
            return false;
        });
}

async function add_inventory(nOfTurbines) {
    if (await has_inventory(nOfTurbines)) {
        return;
    }

    nOfTurbines = nOfTurbines == null ? 2 : nOfTurbines;

    const inventory = JSON.stringify(create_inventory(nOfTurbines));

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    axios
        .post('https://localhost:10443/api/configuration/site', inventory, {headers: {'Content-Type': 'application/json'}})
        .then(() => {
            console.log(`${nOfTurbines} turbines was successfully added to the inventory service`);
        })
        .catch(() => {
            console.error('Request to add inventory to inventory service failed');
        });
}

function create_inventory(nOfTurbines) {
    return {
        Id: 1,
        Name: "AC - 1",
        AlarmLogId: 10,
        Parks: [
            {
                Id: 1,
                Name: "AC - Park 01",
                Stations: null
            },
            {
                Id: 2,
                Name: "AC - Park 02",
                Stations: create_turbines(nOfTurbines)
            }
        ]
    };
}

function create_turbines(nOfTurbines) {
    const turbines = [];

    for (let i = 1; i <= nOfTurbines; i++) {
        turbines.push({
            Id: i,
            Name: 'T' + (i < 10 ? `0${i}` : i),
            NominalPower: 14000,
            CommunicationId: 230000 + i,
            StationType: {
                Id: 1,
                Name: "Turbine"
            },
            TurbineType: {
                Id: 1,
                Name: "SG 14-222 DD"
            },
            IpAddress: "127.0.0.1"
        })
    }

    return turbines;
}



