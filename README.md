# dever

Tool to help speed up local development and keep it consistent across a team

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
dever env -l
```

If the component you're interested in starting an local environment for is available. Use any of the keywords as [component] in dever env [component]

As as example you might want to run the environment for an component. Then the command would possibly be like this

```
dever env ec --start
```

Additional commands are available for environment setup / help therefore it's a good idea to check possible commands like this

```
dever env ec
```
or
```
dever env ec --help
```

Or you could also check the list of commands below in the [Available Commands](#available-commands)

## Available commands

| Command | Description |
| ---  | ---     |
| dever | shows help context for dever options |
| dever init | initializes dever by finding all dever.json files on your machine |
| dever install | Show help context for dever install options |
| dever install -l, --list | List all currently known projects which has install section defined in dever.json |
| dever install [keyword] | Installs all available packages for specified project keyword if available or shows help |
| dever install [keyword] -l, --list | List all options under install section in the projects dever.json |
| dever install [keyword] -lgs, --list-groups | List of all installation groups under install section in the projects dever.json |
| dever install [keyword] -lg, --list-group | List of all installs underneath a specific group in the projects dever.json |
| dever install [keyword] -g, --group | Install all items underneath a specific group in the projects dever.json |
| dever install [keyword] -o, --only | Install only specific package |
| dever install [keyword] -i, --ignore | Ignore confirmations |
| dever install [keyword] -nba, --no-before-after | Disables running of before and after functionality if defined in project dever.json |
| dever env | shows help context for dever env options |
| dever env -l | lists all components with their name and keywords |
| dever env -c | shows content of dever_config.json |
| dever env [keyword] | shows help context for dever env [keyword] options |
| dever env [keyword] --start | attempts to start all dependencies for specific project environment |
| dever env [keyword] --start --clean | attempts to start all dependencies for specific project environment cleanly e.g. recreating docker containers |
| dever env [keyword] --start --ignore | attempts to start all dependencies for specific project environment with any need for confirmations |
| dever env [keyword] --location | shows location of project dever.json |
| dever env [keyword] -c, --config | shows content of project dever.json |

## Running the tests
Currently no tests implemented..

## Built With

* [NodeJS](https://nodejs.org/en/) - Required for development
* [npmjs](https://www.npmjs.com/) - Dependency management included as part of the NodeJS installation
* [WebStorm](https://www.jetbrains.com/webstorm/) - Main editor

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting merge requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [releases on this repository](https://github.com/czprz/dever/releases). 

## Authors

* **[Casper Overholm Elkrog](https://github.com/czprz)** - *Initial work*

See also the list of [contributors](https://github.com/czprz/dever/network/) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
