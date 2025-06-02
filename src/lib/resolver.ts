import { dirname, join } from 'path';
import { ProjectFileResolverError, SasqlConfig } from './config.js';
import { DiagnosticMessage } from './diagnostic-message.js';
import { globSync } from 'glob';
import { sys } from './sys.js';

export const useRegex = /@use '([.\/a-z_-]+)' as ([a-z_-]+);/g;

export class ProjectFile {
    public imports = new Map<string, ProjectFile>();

    constructor(
        public source: string,
        public fsPath: string,
        public ctx: Resolver
    ) {}

    public get hasImports() {
        return this.imports.size > 0;
    }

    public get importPaths() {
        return Array.from(this.imports.values());
    }

    public resolveImports() {
        try {
            this._matchUseStmts().forEach((arr) => {
                const { alias, fsPath } = this._parseUseStmt(arr);
                if (!alias || !fsPath) return;

                if (this.ctx.projectFiles.has(fsPath)) {
                    this.imports.set(alias, this.ctx.projectFiles.get(fsPath)!);
                    return;
                }

                try {
                    const { fsPath: _fsPath, source: _source } =
                        this.ctx.readProjectFile(fsPath);
                    const projectFile = new ProjectFile(
                        _source,
                        _fsPath,
                        this.ctx
                    );
                    this.ctx.projectFiles.set(
                        _fsPath,
                        projectFile.resolveImports()
                    );
                    this.imports.set(alias, projectFile);
                } catch (e) {
                    this.ctx.unknownExceptions.push({
                        fsPath: this.fsPath,
                        error: e
                    });
                }
            });
        } catch (error) {
            this.ctx.unknownExceptions.push({
                fsPath: this.fsPath,
                error
            });
        }

        return this;
    }

    private _matchUseStmts() {
        const matches: RegExpExecArray[] = [];

        const all = this.source.matchAll(useRegex);

        while (true) {
            let nextMatch = all.next();
            if (nextMatch.done) {
                return matches;
            }
            matches.push(nextMatch.value);
        }
    }

    private _parseUseStmt(matches: RegExpExecArray) {
        let [stmt, fsPath, alias] = matches;

        if (!stmt) {
            // this should never hit
            this.ctx.unknownExceptions.push({
                error: 'Expected import stmt, received undefined.',
                fsPath: this.fsPath
            });
            return {};
        }

        if (!fsPath) {
            this.ctx.unknownExceptions.push({
                error: 'Expected path, received undefined.',
                fsPath: this.fsPath
            });
            return {};
        }

        if (!fsPath.endsWith('.sasql')) {
            fsPath = fsPath + '.sasql';
        }

        if (!alias) {
            this.ctx.unknownExceptions.push({
                error: 'Expected alias, received undefined.',
                fsPath: this.fsPath
            });
            return {};
        }

        // If the path specified with @use doesn't exist, assume it's a
        // relative path, and attempt to resolve it
        if (!sys.fileExists(fsPath)) {
            let resolvedPath = join(dirname(this.fsPath), fsPath);
            // If we can't resolve the path, push a diagnostic error
            if (!sys.fileExists(resolvedPath)) {
                this.ctx.unknownExceptions.push({
                    error: `Failed to resolve import at ` + resolvedPath,
                    fsPath: this.fsPath
                });
                return {};
            }
            fsPath = resolvedPath;
        }

        return { fsPath, alias };
    }
}

export class Resolver {
    public projectFiles = new Map<string, ProjectFile>();

    public unknownExceptions: ProjectFileResolverError[] = [];
    public diagnosticMessages: DiagnosticMessage[] = [];

    constructor(
        public projectConfig: SasqlConfig,
        public projectRoot: string
    ) {}

    public resolve() {
        this.loadProjectFiles();
        return this;
    }

    public loadProjectFiles() {
        const projectFiles = this.projectConfig.include
            .map((includeStr) => join(this.projectRoot, includeStr))
            .flatMap((fsPath) => {
                try {
                    return globSync(fsPath).flatMap((fsPath) => {
                        try {
                            return [this.readProjectFile(fsPath)];
                        } catch (error) {
                            this.unknownExceptions.push({ fsPath, error });
                            return [];
                        }
                    });
                } catch (error) {
                    this.unknownExceptions.push({
                        fsPath,
                        error
                    });
                }

                return [];
            });

        projectFiles.forEach(({ fsPath, source }) => {
            this.projectFiles.set(
                fsPath,
                new ProjectFile(source, fsPath, this).resolveImports()
            );
        });
    }

    public readProjectFile(fsPath: string) {
        const source = sys.readFile(fsPath);
        if (!source) {
            throw new Error('Failed to read project file.');
        }
        return { fsPath, source };
    }

    public hasProjectFile(fsPath: string) {
        return this.projectFiles[fsPath];
    }
}
