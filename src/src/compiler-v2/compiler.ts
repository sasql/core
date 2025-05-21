import {
    isIncludeDirectiveV2,
    ParseResult,
    UseDirective,
    Token,
    IncludeDirective,
    StatementDirective
} from './types.js';
import { dirname, join } from 'path';
import { DiagnosticCategory, DiagnosticMessage } from './diagnostic-message.js';
import { tokenize } from './tokenizer.js';
import { parse } from './parser.js';
import { format, FormatOptionsWithLanguage } from 'sql-formatter';
import { sys } from './sys.js';

export declare interface SourceFile extends ParseResult {
    tokens: Token[];
    toEmit: string;
    formatted?: string;
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
): SourceFile {
    /** Holds the source files for entry file and all descendents. */
    const includes: Record<string, SourceFile> = {};

    /** Holds diagnostic messages from entry file and all descendents. */
    const diagnosticMessages: DiagnosticMessage[] = [];

    /** Holds unknown exceptions from entry file and all descendents. */
    const unknownExceptions: unknown[] = [];

    return compile(entryPath, undefined, options?.entrySource);

    function compile(
        srcPath: string,
        srcToken?: UseDirective,
        source?: string
    ): SourceFile {
        if (!source) {
            try {
                source = readSrcFile(srcPath, srcToken);
            } catch (e) {
                onError(e);
                source = '';
            }
        }

        // Tokenize source
        const tokens = tokenizeSrc(source, srcPath);

        // Parse tokens
        const { imports, chunks, statements } = parseSrc(
            source,
            srcPath,
            tokens
        );

        // Resolve imports
        resolveImports(srcPath, imports);

        let toEmit = chunks
            .map((chunk) => {
                if (!isIncludeDirectiveV2(chunk)) return chunk.text;

                try {
                    return resolveInclude(source, srcPath, chunk);
                } catch (e) {
                    onError(e);
                    return '';
                }
            })
            .join(' ');

        let formatted: string;

        try {
            const formatOptions = options?.format ?? {};

            if (!formatOptions.language) {
                formatOptions.language = 'postgresql';
            }

            formatted = format(toEmit, formatOptions);
        } catch (e) {
            onError(e);
            formatted = '';
        }

        return {
            tokens,
            chunks,
            imports,
            statements,
            toEmit,
            formatted,
            diagnosticMessages,
            unknownExceptions
        };
    }

    function tokenizeSrc(source: string, srcPath: string) {
        let tokens: Token[] = [];

        if (source) {
            try {
                const tokenizeResult = tokenize(source, srcPath, {
                    ignoreWhitespace: options?.ignoreWhitespace || true
                });

                tokens = tokenizeResult.tokens;
                diagnosticMessages.push(...tokenizeResult.diagnosticMessages);
            } catch (e) {
                onError(e);
            }
        }

        return tokens;
    }

    function parseSrc(source: string, srcPath: string, tokens: Token[]) {
        let imports: Record<string, UseDirective> = {};
        let chunks: (Token | IncludeDirective)[] = [];
        let statements: Record<string, StatementDirective> = {};

        if (source) {
            try {
                const parseResult = parse(tokens, source, srcPath, {
                    removeComments: options?.removeComments ?? true
                });

                imports = parseResult.imports;
                chunks = parseResult.chunks;
                statements = parseResult.statements;
            } catch (e) {
                onError(e);
            }
        }

        return { imports, chunks, statements };
    }

    function resolveImports(
        srcPath: string,
        imports: Record<string, UseDirective>
    ) {
        if (Object.keys(imports).length > 0) {
            Object.entries(imports).forEach(([alias, use]) => {
                try {
                    const resolved = compileImport(use, srcPath);
                    includes[alias] = resolved;

                    diagnosticMessages.push(...resolved.diagnosticMessages);
                    unknownExceptions.push(...resolved.unknownExceptions);
                } catch (e) {
                    onError(e);
                }
            });
        }
    }

    function compileImport(directive: UseDirective, srcPath: string) {
        const { alias: _alias, path } = directive;

        const srcDir = dirname(srcPath);

        let relativePath = path.text.substring(1, path.text.length - 1);
        if (!relativePath.endsWith('.sasql')) {
            relativePath += '.sasql';
        }

        const importPath = join(srcDir, relativePath);

        if (includes[importPath]) {
            return includes[importPath];
        }

        return compile(join(srcDir, relativePath), directive);
    }

    function resolveInclude(
        source: string,
        srcPath: string,
        include: IncludeDirective
    ) {
        const { import: imported, module } = include;

        const resolvedImport = includes[module.text];
        if (!resolvedImport) {
            throw new DiagnosticMessage(
                'Failed to resolve @include.',
                DiagnosticCategory.ERROR,
                source ?? '',
                srcPath,
                module
            );
        }

        const resolvedStatement = resolvedImport.statements[imported.text];

        if (!resolvedStatement) {
            throw new DiagnosticMessage(
                'Failed to resolve @include',
                DiagnosticCategory.ERROR,
                source ?? '',
                srcPath,
                imported
            );
        }

        // @to-do - add validation here
        return resolvedStatement.bracedExpression
            .map((token) => token.text)
            .join(' ');
    }

    function onError(e: unknown) {
        if (e instanceof DiagnosticMessage) {
            diagnosticMessages.push(e);
        } else {
            unknownExceptions.push(e);
        }
    }

    function readSrcFile(srcPath: string, srcToken?: UseDirective) {
        if (!sys.fileExists(srcPath)) {
            if (srcToken) {
                throw new DiagnosticMessage(
                    'Failed to resolve import',
                    DiagnosticCategory.ERROR,
                    '',
                    srcPath,
                    srcToken.path
                );
            } else {
                throw new Error('Failed to resolve src file.');
            }
        }

        const source = sys.readFile(srcPath);
        if (!source) {
            if (srcToken) {
                throw new DiagnosticMessage(
                    'Failed to read file.',
                    DiagnosticCategory.ERROR,
                    '',
                    srcPath,
                    srcToken.path
                );
            } else {
                throw new Error('Failed to read src file.');
            }
        }

        return source;
    }
}
