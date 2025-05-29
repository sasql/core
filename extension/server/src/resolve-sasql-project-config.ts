import { readProjectConfig, resolveProjectFiles } from '@sasql/core';
import { existsSync } from 'fs';
import { join } from 'path';

export function resolveSasqlProjectConfig(paths: string[]) {
    return paths.flatMap((fsPath) => {
        const configPath = join(fsPath, 'sasqlconfig.json');

        if (!existsSync(configPath)) {
            return [];
        }

        const config = readProjectConfig(configPath);
        const files = resolveProjectFiles(fsPath, config);

        return [
            {
                rootDir: fsPath,
                configPath,
                config,
                files
            }
        ];
    });
}
