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

export declare interface ProjectFileResolver {
    projectFiles: ProjectFile[];
    errors: ProjectFileResolverError[];
}

export declare interface ProjectFile {
    fsPath: string;
    source: string;
}

export declare interface ProjectFileResolverError {
    fsPath?: string;
    error: unknown;
}

export function resolveProjectFiles(
    projectRoot: string,
    projectConfig: SasqlConfig
): ProjectFileResolver {
    const errors: ProjectFileResolverError[] = [];

    const projectFiles = projectConfig.include
        .map((includeStr) => join(projectRoot, includeStr))
        .flatMap((f) => {
            try {
                return globSync(f).flatMap((fsPath) => {
                    try {
                        return readProjectFile(fsPath);
                    } catch (error) {
                        errors.push({ fsPath, error });
                        return [];
                    }
                });
            } catch (error) {
                // @todo - Diagnostic message
                errors.push({ error });
                return [];
            }
        });

    return {
        projectFiles,
        errors
    };
}

export function readProjectFile(fsPath: string) {
    const source = sys.readFile(fsPath);
    if (!source) {
        throw new Error('Failed to read project file.');
    }
    return { fsPath, source };
}
