import {apply} from "ajv/lib/ajv.js";

import {MigrationInterface} from "../MigrationInterface.js";

export default new class extends MigrationInterface {
    _migrate(project, config) {
        if (project.version > 1) {
            return;
        }

        const patch = {
            version: 2
        };
        
        return apply(project, patch);
    }
}