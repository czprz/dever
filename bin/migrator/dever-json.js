import fs from "fs";
import path from "path";

import json from "../common/helper/json.js";
import {Config} from "../common/models/dot-dever/external.js";
import {MigrationInterface} from "./migrations/MigrationInterface.js";

export default new class {
    /**
     * Migrate dever-json
     * @param config {Config}
     */
    migrate(config) {
        for (const project of config.projects) {
            const projectConfig = json.read(project.path);
            if (projectConfig == null) {
                continue;
            }

            const directoryPath = '';

            fs.readdirSync(directoryPath).forEach(file => {
                const filePath = path.join(directoryPath, file);

                import(filePath).then(module => {
                    const MigrationClass = module.default;

                    const migration = new MigrationClass();

                    if (migration instanceof MigrationInterface) {
                        const newData = migration.migrate(projectConfig, config);
                        fs.writeFileSync(project.path, JSON.stringify(newData, null, 2));
                    }
                });
            });
        }
    }
}