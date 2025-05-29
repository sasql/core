import {
    isIncludeDirectiveV2,
    UseDirective,
    Token,
    IncludeDirective,
    ParseResult,
    StatementDirective,
    Compiler,
    CompilerProgramOptions,
    CompilerOutput,
    CompilerProgram,
    RecompileOutput
} from './types.js';
import { dirname, join } from 'path';
import { DiagnosticCategory, DiagnosticMessage } from './diagnostic-message.js';
import { tokenize } from './tokenizer.js';
import { parse } from './parser.js';
import { sys } from './sys.js';
import {
    findProjectConfig,
    readProjectConfig,
    resolveProjectFiles,
    SasqlConfig
} from './config.js';

export function createCompilerProgram(
    projectRootDir: string,
    options?: CompilerProgramOptions
): CompilerProgram {
    /** Holds the source files for entry file and all descendents. */
    const compilers = new Map<string, Compiler>();

    class _Compiler implements Compiler {
        public imports: Record<string, Compiler> = {};

        public dependants: Record<string, Compiler> = {};

        public statements: Record<string, StatementDirective> = {};

        public output: string | undefined;

        public formatted: string | undefined;

        public diagnosticMessages: DiagnosticMessage[] = [];

        public unknownExceptions: unknown[] = [];

        public initialized = false;

        constructor(
            public srcPath: string,
            public source: string,
            public srcToken?: UseDirective
        ) {}

        recompile(source?: string): RecompileOutput {
            // Clear diagnostic messages
            this.diagnosticMessages.length = 0;
            this.unknownExceptions.length = 0;

            source ??= sys.readFile(this.srcPath);
            if (!source) {
                throw new Error('Source no longer exists');
            }
            this.source = source;

            const results = this.compile();

            const recompiled: {
                [fsPath: string]: CompilerOutput;
            } = {};

            // Recompile all files that import this file
            Object.values(this.dependants).forEach((compiler) => {
                const output = compiler.recompile();
                recompiled[compiler.srcPath] = output;
            });

            return {
                diagnosticMessages: this.diagnosticMessages,
                unknownExceptions: this.unknownExceptions,
                output: results.output,
                recompiled
            };
        }

        compile(): CompilerOutput {
            this.initialized = true;

            // Tokenize the source text
            const tokens = this._tokenize();

            // Parse the source tokens
            const { imports, chunks, statements } = this._parseSrc(tokens);

            this.statements = statements;

            // Resolve and compile imports
            Object.entries(imports).forEach(([alias, use]) => {
                try {
                    this._resolveImport(alias, use);
                } catch (e) {
                    this._onError(e);
                }
            });

            // Compile anything that is not an import or a directive
            this.output = chunks
                .map((chunk) => {
                    if (!isIncludeDirectiveV2(chunk)) return chunk.text;

                    try {
                        return this._resolveInclude(chunk);
                    } catch (e) {
                        this._onError(e);
                        return '';
                    }
                })
                .join(' ');

            return {
                output: this.output,
                diagnosticMessages: this.diagnosticMessages,
                unknownExceptions: this.unknownExceptions
            };
        }

        private _tokenize() {
            let tokens: Token[] = [];

            if (this.source) {
                try {
                    const tokenizeResult = tokenize(this.source, this.srcPath, {
                        ignoreWhitespace: options?.ignoreWhitespace || true
                    });

                    tokens = tokenizeResult.tokens;
                    this.diagnosticMessages.push(
                        ...tokenizeResult.diagnosticMessages
                    );
                } catch (e) {
                    this._onError(e);
                }
            }

            return tokens;
        }

        private _parseSrc(tokens: Token[]): ParseResult {
            try {
                const parseResult = parse(tokens, this.source, this.srcPath, {
                    removeComments: options?.removeComments ?? true
                });

                this.diagnosticMessages.push(...parseResult.diagnosticMessages);
                this.unknownExceptions.push(...parseResult.unknownExceptions);

                return parseResult;
            } catch (e) {
                this._onError(e);
            }

            return {
                imports: {},
                chunks: [],
                statements: {},
                diagnosticMessages: this.diagnosticMessages,
                unknownExceptions: this.unknownExceptions
            };
        }

        //
        // Import Logic
        //

        // @todo - resolve circular dependencies
        private _resolveImport(alias: string, directive: UseDirective): void {
            let absolutePath: string;

            try {
                absolutePath = this._resolveImportPath(
                    directive.path,
                    directive.path.text
                );
            } catch (e) {
                this._onError(e);
                return;
            }

            // If this file has already been initialized as an import,
            // continue
            if (this.imports[absolutePath]) {
                this.diagnosticMessages.push(
                    ...this.imports[absolutePath].diagnosticMessages
                );
                this.unknownExceptions.push(
                    ...this.imports[absolutePath].unknownExceptions
                );
                return;
            }

            // If this imported file has already been compiled--load it
            if (compilers.has(absolutePath)) {
                const imported = compilers.get(absolutePath)!;

                this.imports[alias] = imported;
                imported.dependants[this.srcPath] = <Compiler>this;

                // If the imported file has not been compiled, compile it
                if (imported.initialized === false) {
                    imported.compile();
                }

                this.diagnosticMessages.push(...imported.diagnosticMessages);
                this.unknownExceptions.push(...imported.unknownExceptions);

                return;
            }

            // This import is not included in the program config,
            // but it is included by virtue of it being imported
            const importedSrc = sys.readFile(absolutePath);
            if (importedSrc === undefined) {
                throw new DiagnosticMessage(
                    'Failed to load imported file',
                    DiagnosticCategory.ERROR,
                    this.source,
                    this.srcPath,
                    directive.path
                );
            }

            // Compile the imported file
            const compiler = new _Compiler(
                absolutePath,
                importedSrc,
                directive
            );

            // Push this as a child of the import
            compiler.dependants[this.srcPath] = this;

            // Associate the import with its alias
            this.imports[alias] = compiler;

            // Compile the imported file
            compiler.compile();

            // Attach the imported file's diagnostic messages
            this.diagnosticMessages.push(...compiler.diagnosticMessages);
            this.unknownExceptions.push(...compiler.unknownExceptions);

            // Register the compiler with this project
            compilers.set(absolutePath, compiler);
        }

        private _resolveImportPath(lastToken: Token, path: string) {
            // Remove any trailing or leading quotes
            if (/^["']/.test(path)) path = path.substring(1);
            if (/["']$/.test(path)) path = path.substring(0, path.length - 1);

            // Append file extension if it wasn't included in the import path
            if (!path.endsWith('.sasql')) path += '.sasql';

            // If the file does nto exist, we might need to resolve it
            if (!sys.fileExists(path)) {
                const srcDir = dirname(this.srcPath);
                path = join(srcDir, path);

                if (!sys.fileExists(path)) {
                    throw new DiagnosticMessage(
                        'Failed to resolve import.',
                        DiagnosticCategory.ERROR,
                        this.source,
                        this.srcPath,
                        lastToken
                    );
                }
            }

            return path;
        }

        //
        // Include Logic
        //

        private _resolveInclude(include: IncludeDirective): string {
            const { import: imported, module } = include;

            let resolvedStatement: StatementDirective;

            if (module === 'this') {
                resolvedStatement = this.statements[imported.text];
            } else {
                const resolvedImport = this.imports[module.text];
                if (!resolvedImport) {
                    throw new DiagnosticMessage(
                        `Failed to resolve module ${module.text}.`,
                        DiagnosticCategory.ERROR,
                        this.source ?? '',
                        this.srcPath,
                        module
                    );
                }

                resolvedStatement = resolvedImport.statements[imported.text];
            }

            if (!resolvedStatement) {
                throw new DiagnosticMessage(
                    'Failed to resolve @include',
                    DiagnosticCategory.ERROR,
                    this.source,
                    this.srcPath,
                    imported
                );
            }

            // @to-do - add validation here
            return resolvedStatement.bracedExpression
                .map((token) => token.text)
                .join(' ');
        }

        //
        // Helper Function
        //

        private _onError(e: unknown) {
            if (e instanceof DiagnosticMessage) {
                this.diagnosticMessages.push(e);
            } else {
                this.unknownExceptions.push(e);
            }
        }
    }

    let projectConfig: SasqlConfig;

    if (options?.programConfig) {
        projectConfig = options.programConfig;
    } else {
        const projectConfigPath = findProjectConfig(projectRootDir);
        projectConfig = readProjectConfig(projectConfigPath);
    }

    const projectFiles = resolveProjectFiles(projectRootDir, projectConfig);

    projectFiles.forEach(({ source, srcPath }) => {
        if (!source) return;
        const compiler = new _Compiler(srcPath, source);
        compilers.set(srcPath, compiler);
    });

    function compileProject() {
        let output: Record<string, string> = {};
        const diagnosticMessages: DiagnosticMessage[] = [];
        const unknownExceptions: unknown[] = [];

        Array.from(compilers.keys()).forEach((k) => {
            const result = compilers.get(k)!.compile();

            diagnosticMessages.push(...result.diagnosticMessages);
            unknownExceptions.push(...result.unknownExceptions);

            output[k] = result.output;
        });

        return {
            output,
            diagnosticMessages,
            unknownExceptions
        };
    }

    return { compilers, compileProject };
}
