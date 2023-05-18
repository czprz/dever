import schemaValidator, {SchemaTypes} from "../common/validators/schema-validator.js";
import ConfigLoader from "../configuration/config-loader.js";

import DotDeverAddMigrationVersion002 from "./migrations/dot-dever/dot-dever-add-migration-version.002.js";
import DotDeverCreateConfigFile001 from "./migrations/dot-dever/dot-dever-create-config-file.001.js";

import chalk from "chalk";

export default new class {
    migrate() {
        let config = ConfigLoader.get();

        config = DotDeverCreateConfigFile001.migrate(config);
        config = DotDeverAddMigrationVersion002.migrate(config);

        const result = schemaValidator.validate(SchemaTypes.DotDever, 1, config);
        if (!result) {
            console.error(chalk.redBright('Migration of .dever failed validation.'));
            console.error('Please downgrade to previously installed version of dever and create github issue');
            return;
        }

        ConfigLoader.write(config);
    }
}