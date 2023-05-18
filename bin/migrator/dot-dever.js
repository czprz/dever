import schemaValidator, {SchemaTypes} from "../common/validators/schema-validator.js";
import localConfig from "../configuration/local-config.js";

export default new class {
    migrate()  {
        const config = localConfig.raw();
        // TODO: DO DotDever migrations
        // TODO: Add support for rollback, if migrations validation fails
        // TODO: Add message to user to downgrade to previously installed version of dever and create github issue
        localConfig.write(config);

        // TODO: Run validation
        // TODO: Only validate after all migrations for DotDever has been completed
        schemaValidator.validate(SchemaTypes.DotDever, 1, config);
    }
}