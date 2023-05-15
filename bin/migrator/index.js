import localConfig from "../configuration/local-config.js";
import deverJson from "./dever-json.js";
import dotDever from "./dot-dever.js";
import schemaValidator, {SchemaTypes} from "../common/validators/schema-validator.js";

export default new class {
    migrate() {
        const config = localConfig.get();
        if (config == null) {
            return;
        }

        if (config.migrationVersion == null) {
            config.migrationVersion = 0;
        }

        // TODO: Check if has been migrated
        // TODO: Add functionality for forcing migration
        deverJson.migrate(config);

        dotDever.migrate(config);
    }
}