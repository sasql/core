import { basename, dirname, join } from 'path';
import { sys } from './sys.js';
import { globSync } from 'glob';

export declare interface SasqlConfig {
    include: string[];
}

export function findProjectConfig(
    resolveStartDir: string,
    configName = 'sasqlconfig.json'
) {
    return searchUp(resolveStartDir);

    function searchUp(dirOrFileName: string) {
        if (sys.isDirectory(dirOrFileName)) {
            const path = join(dirOrFileName, configName);
            if (sys.fileExists(path)) return path;
            return searchUp(dirname(dirOrFileName));
        }

        if (basename(dirOrFileName) === resolveStartDir) {
            return dirOrFileName;
        }

        // @to-do - diagnostic message
        throw new Error('File not found.');
    }
}

export function readProjectConfig(projectConfigPath: string): SasqlConfig {
    const config = sys.readFile(projectConfigPath);

    if (!config) {
        // @to-do - diagnostic message
        throw new Error('Failed to read project config.');
    }

    return JSON.parse(config);
}

export function resolveProjectFiles(
    projectRoot: string,
    projectConfig: SasqlConfig
) {
    return projectConfig.include
        .map((includeStr) => join(projectRoot, includeStr))
        .flatMap((f) => {
            try {
                return globSync(f).map((path) => {
                    const source = sys.readFile(path);

                    return {
                        srcPath: path,
                        source
                    };
                });
            } catch {
                // @todo - Diagnostic message
                return [];
            }
        });
}
