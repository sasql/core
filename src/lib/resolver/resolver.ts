import { dirname, join } from 'path';
import { sys } from '../sys.js';
import {
    findProjectConfig,
    readProjectConfig,
    resolveProjectFiles
} from '../config.js';
import { getUseStmts } from './get-use-stmts.js';

export declare interface Resolver {
    source: string;
    srcDir: string;
    sourcePath: string;
    dependants: Resolver[];
    imports: Record<string, Resolver>;
    resolve(): Resolver;
}

/**
 *
 * @param projectRootDir The directory where the `sasqlconfig.json` file is,
 * or a directory within the `sasqlconfig.json` directory.
 * @returns
 */
export function createResolver(projectRootDir: string) {
    const resolvers: { [srcPath: string]: Resolver } = {};

    class _Resolver implements Resolver {
        public dependants: Resolver[] = [];
        public imports: Record<string, Resolver> = {};

        public srcDir: string;

        constructor(
            public source: string,
            public sourcePath: string
        ) {
            this.srcDir = dirname(this.sourcePath);
        }

        resolve() {
            getUseStmts(this.source).forEach((stmt) => {
                const path = join(this.srcDir, stmt.path);

                // If this import has already been resolved,
                // add it to this module's imports array,
                // and add this to the imported module's dependants
                if (resolvers[path]) {
                    this.imports[path] = resolvers[path];
                    resolvers[path].dependants.push(this);
                    return;
                }

                // If the import path does not exist, throw a diagnostic message
                if (!sys.fileExists(path)) {
                    // @todo - diagnostic message
                    throw new Error('Failed to resolve import.');
                }

                const useSource = sys.readFile(path);

                // If the file read failed, throw a diagnostic message
                if (!useSource) {
                    // @todo - diagnostic message
                    throw new Error('Failed to read import.');
                }

                // Create a resolver for the imported file
                const resolver = new _Resolver(useSource, path);
                resolver.dependants.push(this);
                this.imports[path] = resolver;

                resolver.resolve();
            });

            resolvers[this.sourcePath] = this;

            return this;
        }
    }

    const projectConfigPath = findProjectConfig(projectRootDir);
    const projectConfig = readProjectConfig(projectConfigPath);
    const projectFiles = resolveProjectFiles(projectRootDir, projectConfig);

    // Initialize resolvers for all project files
    projectFiles.forEach(({ source, srcPath }) => {
        if (!source) return; // @to-do diagnostic-message
        const resolver = new _Resolver(source, srcPath);
        resolvers[srcPath] = resolver;
    });

    Object.keys(resolvers).forEach((path) => {
        resolvers[path].resolve();
    });

    return resolvers;
}
