# dever

Tool to help speed up local development and keep it consistent across a team

[![Pipeline](https://github.com/czprz/dever/actions/workflows/pipeline.yml/badge.svg?branch=main)](https://github.com/czprz/dever/actions/workflows/pipeline.yml)
[![codeql](https://github.com/czprz/dever/actions/workflows/codeql.yml/badge.svg)](https://github.com/czprz/dever/actions/workflows/codeql.yml)

## Getting Started

```
git clone https://github.com/czprz/dever.git
```

## Installation

### Prerequisites

```
NodeJS 18.9.0 or higher
```

### Installing

```
npm install @czprz/dever -g
```

## Using

### Preparing dever.json

dever.json should be placed in the root of your project's folder.<br>
Example of the content in a dever.json can be found here. [dever-example.json](dever-example.json)

### Running dever

After dever has been installed. Run below command for finding all dever.json

```
dever scan
```

After you can list all found projects using below command

```
dever list
```

When interacting with segments. Use any of the keywords together with the segment key.
in `dever [keyword] [segment.key]`<br>
This'll show you all available commands and options for the segment.

e.g.

```
dever ec env
```

Running segments can be done with the command below.

```
dever ec env up
```

**Note:** If any errors occur during an execution. You'll be informed that error messages can be found in a log file at
end of the execution.

## Available commands

| Command                                                      | Description                                                          |
|--------------------------------------------------------------|----------------------------------------------------------------------|
| dever                                                        | Shows help context for dever options                                 |
| dever init                                                   | Adds dever support to project in location of terminal                |
| dever init -p, --path                                        | Adds dever to support to project in location of path                 |
| dever scan                                                   | Scans for all dever supported projects                               |
| dever list                                                   | Lists all found projects                                             |
| dever list --not-supported                                   | Lists all found not supported projects                               |
| dever config set [key] [value]                               | Sets config key to value provided                                    |
| dever config get [key]                                       | Show value of config key                                             |
| dever config list                                            | Show content of dever_config.json                                    |
| dever config location                                        | Show location of dever_config.json                                   |
| dever validate                                               | Validate any dever.json which is at the same location as the console |
| dever validate -f, --file                                    | Validate any dever.json using a filepath                             |
| dever [keyword] config set [key] [value]                     | Sets config key to value provided                                    |
| dever [keyword] config get [key]                             | Show value of config key                                             |
| dever [keyword] config list                                  | Lists available configuration options and their current value        |
| dever [keyword] config show                                  | Show project configuration                                           |
| dever [keyword] config location                              | Show location of project configuration file                          |
| dever [keyword] [segment]                                    | Shows help context for dever segment options                         |
| dever [keyword] [segment] up                                 | Runs all actions                                                     |
| dever [keyword] [segment] up [name]                          | Runs only specified actions                                          |
| dever [keyword] [segment] up --not [name], -n [name]         | Runs all actions except those mentioned in the --not or -n option    |
| dever [keyword] [segment] up --not-group [name], --ng [name] | Runs all actions expect those grouped in the --not-group option      |
| dever [keyword] [segment] up --clean                         | Runs all actions from scratch                                        |
| dever [keyword] [segment] up --skip                          | Skips confirmations                                                  |
| dever [keyword] [segment] up --shc --skip-hash-check         | Skips hash-checks                                                    |
| dever [keyword] [segment] up-group [name]                    | Runs all actions that belongs to specified group                     |
| dever [keyword] [segment] up-group --not [name], -n [name]   | Runs all actions except those mentioned in the --not option          |
| dever [keyword] [segment] up-group --clean                   | Runs all actions from scratch e.g. recreating docker containers      |
| dever [keyword] [segment] up-group --skip                    | Skips confirmations                                                  |
| dever [keyword] [segment] up-group --shc --skip-hash-check   | Skips hash-checks                 ter                                |
| dever [keyword] [segment] down                               | Takes down all actions                                               |
| dever [keyword] [segment] down [name]                        | Takes down all specified actions                                     |
| dever [keyword] [segment] down --not [name], -n [name]       | Takes down all actions except those mentioned in the --not option    |
| dever [keyword] [segment] down-group [name]                  | Takes down all actions that belong to specified group                |
| dever [keyword] [segment] down-group --not [name], -n [name] | Takes down all actions except those mentioned in the --not option    |
| dever [keyword] [segment] down-group --skip                  | Skips confirmation                                                   |
| dever [keyword] [segment] down-group --shc --skip-hash-check | Skips hash-checks                                                    |
| dever [keyword] [segment] list                               | Lists all available actions                                          |
| dever [keyword] [segment] list [group]                       | Lists all actions belonging to specified group                       |

## Running the tests

Currently no tests implemented..

## Built With

* [Node.js](https://nodejs.org/en/) - Required for development
* [npmjs](https://www.npmjs.com/) - Dependency management included as part of the NodeJS installation

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting a pull
request.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see
the [releases on this repository](https://github.com/czprz/dever/releases).

## Authors

* **[Casper Overholm Elkrog](https://github.com/czprz)** - *Initial work*

See also the list of [contributors](https://github.com/czprz/dever/network/) who participated in this project.

## License

This project is licensed under the The Unlicense - see the [LICENSE](LICENSE) file for details
