import schemaValidator, {SchemaTypes} from "../common/validators/schema-validator.js";
import ConfigLoader from "../configuration/config-loader.js";

import {Config} from '../common/models/dot-dever/external.js';

import DotDeverAddMigrationVersion002 from "./migrations/dot-dever/dot-dever-add-migration-version.002.js";
import DotDeverCreateConfigFile001 from "./migrations/dot-dever/dot-dever-create-config-file.001.js";

export default new class {
    /**
     * Migrate
     * @param config {Config}
     * @param migrationVersion {number}
     * @returns {boolean}
     */
    migrate(config, migrationVersion) {
        config = DotDeverCreateConfigFile001.migrate(config);
        config = DotDeverAddMigrationVersion002.migrate(config);

        const result = schemaValidator.validate(SchemaTypes.DotDever, 1, config);
        if (!result) {
            return false;
        }

        config.migrationVersion = migrationVersion;
        ConfigLoader.write(config);

        return true;
    }
}
