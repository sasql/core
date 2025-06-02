import { dirname, join } from 'path';
import { SasqlConfig } from './config.js';
import { DiagnosticCategory, DiagnosticMessage } from './diagnostic-message.js';
import { globSync } from 'glob';
import { sys } from './sys.js';
import { tokenize } from './tokenizer.js';
import { parse } from './parser.js';
import { StatementDirective, Token, UseDirective } from './types.js';

export const useRegex = /@use '([.\/a-z_-]+)' as ([a-z_-]+);/g;

export class ProjectFile {
    public imports = new Map<string, ProjectFile>();
    public statements = new Map<string, StatementDirective>();

    constructor(
        public source: string,
        public fsPath: string,
        public ctx: Resolver
    ) {}

    public get hasImports() {
        return this.imports.size > 0;
    }

    public parse() {
        const tokenized = tokenize(this.source, this.fsPath, {
            ignoreWhitespace: true
        });

        this.ctx.diagnosticMessages.push(...tokenized.diagnosticMessages);

        const { diagnosticMessages, imports, statements, unknownExceptions } =
            parse(tokenized.tokens, this.source, this.fsPath, {
                removeComments: true
            });

        this.statements = statements;

        this.ctx.diagnosticMessages.push(...diagnosticMessages);
        this.ctx.unknownExceptions.push(...unknownExceptions);

        imports.forEach((imported) => {
            this.resolveImports(imported);
        });

        return this;
    }

    public resolveImports(directive: UseDirective) {
        const fsPath = this.resolveImportPath(
            directive.path.text,
            directive.path
        );

        if (!fsPath) return;

        if (this.ctx.projectFiles.has(fsPath)) {
            this.imports.set(
                directive.alias.text,
                this.ctx.projectFiles.get(fsPath)!
            );
            return;
        }

        try {
            const { fsPath: _fsPath, source: _source } =
                this.ctx.readProjectFile(fsPath);
            const projectFile = new ProjectFile(_source, _fsPath, this.ctx);
            this.ctx.projectFiles.set(_fsPath, projectFile.parse());
            this.imports.set(directive.alias.text, projectFile);
        } catch (e) {
            this.ctx.unknownExceptions.push({
                fsPath: this.fsPath,
                error: e
            });
        }

        return this;
    }

    resolveImportPath(fsPath: string, lastToken: Token) {
        if (fsPath.startsWith("'") || fsPath.startsWith('"')) {
            fsPath = fsPath.substring(1, fsPath.length - 1);
        }

        if (!fsPath.endsWith('.sasql')) {
            fsPath = fsPath + '.sasql';
        }

        // If the path specified with @use doesn't exist, assume it's a
        // relative path, and attempt to resolve it
        if (!sys.fileExists(fsPath)) {
            let resolvedPath = join(dirname(this.fsPath), fsPath);
            // If we can't resolve the path, push a diagnostic error
            if (!sys.fileExists(resolvedPath)) {
                console.log(resolvedPath);
                this.ctx.diagnosticMessages.push(
                    new DiagnosticMessage(
                        'Failed to resolve import at ' + fsPath,
                        DiagnosticCategory.ERROR,
                        this.source,
                        this.fsPath,
                        lastToken
                    )
                );
                return null;
            }
            return resolvedPath;
        }

        return fsPath;
    }
}

export class Resolver {
    public projectFiles = new Map<string, ProjectFile>();

    public unknownExceptions: unknown[] = [];
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
                new ProjectFile(source, fsPath, this).parse()
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
