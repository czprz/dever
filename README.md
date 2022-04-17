# dever

Tool to help speed up local development and keep it consistent across a team

[![Pipeline](https://github.com/czprz/dever/actions/workflows/pipeline.yml/badge.svg?branch=main)](https://github.com/czprz/dever/actions/workflows/pipeline.yml)
[![codeql](https://github.com/czprz/dever/actions/workflows/codeql.yml/badge.svg)](https://github.com/czprz/dever/actions/workflows/codeql.yml)

## Getting Started

```
git clone https://github.com/czprz/dever.git
```

### Prerequisites
```
NodeJS 14.18.1 or higher
```

### Installing
```
npm install dever -g
```

### Using dever

After dever has been installed then these commands is available.

Firstly you'll run. To find all dever.json files.

```
dever init
```

Afterwards you can list all available components by running the command

```
dever list
```

If the project you're interested in starting a local environment for is available. Use any of the keywords as [keyword] in `dever [keyword] env`

As an example, you might want to run the environment for a project. Then the command would possibly be like this

```
dever ec env --start
```
**Note:** If any errors occur during an execution. You'll be informed that error messages can be found in a log file at end of the command.

Additional commands are available for environment setup / help therefore it's a good idea to check possible commands like this

```
dever ec env
```
or
```
dever ec env --help
```

Or you could also check the list of commands below in the [Available Commands](#available-commands)

## Available commands

| Command | Description |
| ---  | ---     |
| dever | shows help context for dever options |
| dever init | initializes dever by finding all dever.json files on your machine |
| dever list | Lists all found projects |
| dever list --not-supported | Lists all found not supported projects |
| dever config | Show content of dever_config.json |
| dever config --location, -l | Show location of dever_config.json |
| dever validate | Validate any dever.json which is at the same location as the console |
| dever validate -f, --file | Validate any dever.json using a filepath |
| dever [keyword] install | Installs all available packages for specified project keyword if available or shows help |
| dever [keyword] install -l, --list | List all options under install section in the projects dever.json |
| dever [keyword] install -lgs, --list-groups | List of all installation groups under install section in the projects dever.json |
| dever [keyword] install -lg, --list-group | List of all installs underneath a specific group in the projects dever.json |
| dever [keyword] install -g, --group | Install all items underneath a specific group in the projects dever.json |
| dever [keyword] install -o, --only | Install only specific package |
| dever [keyword] install -i, --ignore | Ignore confirmations |
| dever [keyword] install -nba, --no-before-after | Disables running of before and after functionality if defined in project dever.json |
| dever [keyword] env | shows help context for dever env options |
| dever [keyword] env | shows help context for dever env [keyword] options |
| dever [keyword] env --start | attempts to start environment |
| dever [keyword] env --start [name] | attempts to start only specified environment dependencies |
| dever [keyword] env --start --not [name] | attempts to start environment dependencies except those mentioned in the --not option |
| dever [keyword] env --start --not-group [name] | attempts to start environment dependencies expect those grouped in the --not-group option |
| dever [keyword] env --stop | attempts to stop environment |
| dever [keyword] env --stop --not [name] | attempts to stop environment dependencies except those mentioned in the --not option |
| dever [keyword] env --stop --not-group [name] | attempts to stop environment dependencies expect those grouped in the --not-group option |
| dever [keyword] env --start --clean | attempts to start environment cleanly e.g. recreating docker containers |
| dever [keyword] env --start --skip | attempts to start environment without any need for confirmations |
| dever [keyword] env --start-group [name] | attempts start grouped environment dependencies |
| dever [keyword] env --stop-group [name] | attempts to stop grouped environment dependencies |
| dever [keyword] env --location | shows location of project dever.json |
| dever [keyword] env -c, --config | shows content of project dever.json |
| dever [keyword] fix | Show help context for fix command |
| dever [keyword] fix [key] | Execute project fix listed in dever.json |
| dever [keyword] fix -l, --list | List all available project fixes listed in dever.json |
| dever [keyword] fix -s, --show | Show in the console what the fix will execute |

## Running the tests
Currently no tests implemented..

## Built With

* [Node.js](https://nodejs.org/en/) - Required for development
* [npmjs](https://www.npmjs.com/) - Dependency management included as part of the NodeJS installation

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting a pull request.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [releases on this repository](https://github.com/czprz/dever/releases). 

## Authors

* **[Casper Overholm Elkrog](https://github.com/czprz)** - *Initial work*

See also the list of [contributors](https://github.com/czprz/dever/network/) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
