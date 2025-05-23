import {
    isIncludeDirectiveV2,
    UseDirective,
    Token,
    IncludeDirective,
    ParseResult,
    StatementDirective
} from './types.js';
import { dirname, join } from 'path';
import { DiagnosticCategory, DiagnosticMessage } from './diagnostic-message.js';
import { tokenize } from './tokenizer.js';
import { parse } from './parser.js';
import { format, FormatOptionsWithLanguage } from 'sql-formatter';
import { sys } from './sys.js';

export declare interface Compiler {
    /** The source text of the .sasql file. */
    source: string;

    /** The absolute path to the .sasql file. */
    srcPath: string;

    /** The directive that imports this file. */
    srcToken?: UseDirective;

    /** Files that this file imports via `@use`. */
    imports: Record<string, Compiler>;

    /** Files that imported this file via `@use`. */
    dependants: Compiler[];

    /** Statements declared in this file via `@statement`. */
    statements: Record<string, StatementDirective>;

    /**
     * The compiled out. Has a value of `undefined` until
     * {@link compile} is called.
     */
    output: string | undefined;

    /**
     * {@link output}, formatted. Has value of `undefined` if
     * {@link compile} hasn't been called or `format` fails.
     */
    formatted: string | undefined;

    /** Holds diagnostic messages from entry file and all descendents. */
    diagnosticMessages: DiagnosticMessage[];

    /** Holds unknown exceptions from entry file and all descendents. */
    unknownExceptions: unknown[];

    /**
     * Compiles this file.
     * @param compileImports `true` if files imported via `@use` should be compiled.
     */
    compile(compileChildren?: boolean): CompilerOutput;
    tokenize(): Token[];
    parseSrc(tokens: Token[]): ParseResult;
    resolveImport(
        alias: string,
        directive: UseDirective,
        compile: boolean
    ): void;
    resolveInclude(include: IncludeDirective): string;
    readSrcFile(): void;
}

export declare interface CompilerOutput {
    output: string;
    formatted: string;
    diagnosticMessages: DiagnosticMessage[];
    unknownExceptions: unknown[];
}

export function createCompilerProgram(
    entryPath: string,
    options?: {
        ignoreWhitespace?: boolean;
        removeComments?: boolean;
        entrySource?: string;
        format?: FormatOptionsWithLanguage;
    }
): Compiler {
    /** Holds the source files for entry file and all descendents. */
    const includes: Record<string, Compiler> = {};

    class _Compiler implements Compiler {
        public source: string;

        public imports: Record<string, Compiler> = {};

        public dependants: Compiler[] = [];

        public statements: Record<string, StatementDirective> = {};

        public output: string | undefined;

        public formatted: string | undefined;

        public diagnosticMessages: DiagnosticMessage[] = [];

        public unknownExceptions: unknown[] = [];

        constructor(
            public srcPath: string,
            public srcToken?: UseDirective,
            source?: string
        ) {
            if (!source) {
                try {
                    this.source = this.readSrcFile();
                } catch (e) {
                    this._onError(e);
                    this.source = '';
                }
            } else {
                this.source = source;
            }
        }

        readSrcFile() {
            if (!sys.fileExists(this.srcPath)) {
                if (this.srcToken) {
                    throw new DiagnosticMessage(
                        'Failed to resolve import',
                        DiagnosticCategory.ERROR,
                        '',
                        this.srcPath,
                        this.srcToken.path
                    );
                } else {
                    throw new Error('Failed to resolve src file.');
                }
            }

            const source = sys.readFile(this.srcPath);
            if (!source) {
                if (this.srcToken) {
                    throw new DiagnosticMessage(
                        'Failed to read file.',
                        DiagnosticCategory.ERROR,
                        '',
                        this.srcPath,
                        this.srcToken.path
                    );
                } else {
                    throw new Error('Failed to read src file.');
                }
            }

            return source;
        }

        compile(compileImports?: boolean): CompilerOutput {
            // Clear diagnostic messages
            this.diagnosticMessages.length = 0;
            this.unknownExceptions.length = 0;

            // Tokenize the source text
            const tokens = this.tokenize();

            // Parse the source tokens
            const { imports, chunks, statements } = this.parseSrc(tokens);

            this.statements = statements;

            // Resolve and compile imports
            Object.entries(imports).forEach(([alias, use]) => {
                try {
                    this.resolveImport(alias, use, compileImports);
                } catch (e) {
                    this._onError(e);
                }
            });

            // Compile anything that is not an import or a directive
            this.output = chunks
                .map((chunk) => {
                    if (!isIncludeDirectiveV2(chunk)) return chunk.text;

                    try {
                        return this.resolveInclude(chunk);
                    } catch (e) {
                        this._onError(e);
                        return '';
                    }
                })
                .join(' ');

            try {
                const formatOptions = options?.format ?? {};

                if (!formatOptions.language) {
                    formatOptions.language = 'postgresql';
                }

                this.formatted = format(this.output, formatOptions);
            } catch (e) {
                this._onError(e);
                this.formatted = '';
            }

            return {
                output: this.output,
                formatted: this.formatted,
                diagnosticMessages: this.diagnosticMessages,
                unknownExceptions: this.unknownExceptions
            };
        }

        tokenize() {
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

        parseSrc(tokens: Token[]): ParseResult {
            if (this.source) {
                try {
                    const parseResult = parse(
                        tokens,
                        this.source,
                        this.srcPath,
                        {
                            removeComments: options?.removeComments ?? true
                        }
                    );

                    this.diagnosticMessages.push(
                        ...parseResult.diagnosticMessages
                    );
                    this.unknownExceptions.push(
                        ...parseResult.unknownExceptions
                    );

                    return parseResult;
                } catch (e) {
                    this._onError(e);
                }
            }

            return {
                imports: {},
                chunks: [],
                statements: {},
                diagnosticMessages: [],
                unknownExceptions: []
            };
        }

        resolveImport(
            alias: string,
            directive: UseDirective,
            compile = true
        ): void {
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

            // If this imported file has already been compiled--load it
            if (includes[absolutePath]) {
                const imported = includes[absolutePath];

                this.imports[alias] = imported;

                this.diagnosticMessages.push(...imported.diagnosticMessages);
                this.unknownExceptions.push(...imported.unknownExceptions);

                return;
            }

            // Compile the imported file
            const compiler = new _Compiler(absolutePath, directive);

            if (compile) compiler.compile();

            // Reattach the imported file's diagnostic messages
            this.diagnosticMessages.push(...compiler.diagnosticMessages);
            this.unknownExceptions.push(...compiler.unknownExceptions);

            // Push this as a child of the import
            compiler.dependants.push(compiler);

            // Associate the import with its alias
            this.imports[alias] = compiler;

            // Associate the compiler with the
            includes[absolutePath] = compiler;
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

        resolveInclude(include: IncludeDirective): string {
            const { import: imported, module } = include;

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

            const resolvedStatement = resolvedImport.statements[imported.text];

            if (!resolvedStatement) {
                throw new DiagnosticMessage(
                    'Failed to resolve @include',
                    DiagnosticCategory.ERROR,
                    this.source ?? '',
                    this.srcPath,
                    imported
                );
            }

            // @to-do - add validation here
            return resolvedStatement.bracedExpression
                .map((token) => token.text)
                .join(' ');
        }

        private _onError(e: unknown) {
            if (e instanceof DiagnosticMessage) {
                this.diagnosticMessages.push(e);
            } else {
                this.unknownExceptions.push(e);
            }
        }
    }

    return new _Compiler(entryPath, undefined, options?.entrySource);
}
