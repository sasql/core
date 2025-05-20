import ts from 'typescript';
import {
    isIncludeDirectiveV2,
    ParseResult,
    UseDirective,
    Token,
    IncludeDirective
} from './types.js';
import { dirname, join } from 'path';
import { DiagnosticMessage } from '../compiler/diagnostic-message.js';
import { tokenize } from './tokenizer.js';
import { preParse } from './pre-parser.js';

export declare interface SourceFile extends ParseResult {
    tokens: Token[];
    toEmit: string;
}

export function parseSourceFile(
    srcPath: string,
    options: {
        ignoreWhitespace: boolean;
        removeComments: boolean;
    },
    sys?: {
        readFile: typeof ts.sys.readFile;
        fileExists: typeof ts.sys.fileExists;
    },
    srcToken?: UseDirective,
    source?: string
): SourceFile {
    if (!source) {
        source = readSrcFile(srcPath, srcToken, sys?.fileExists, sys?.readFile);
    }

    // @todo - how will our modules be set up? This will likely lead to multiple parse passes for the same file
    const includes: Record<string, SourceFile> = {};

    const tokens = tokenize(source, {
        tokenizeWhitespace: !(options.ignoreWhitespace || true)
    });
    const parseResult = preParse(tokens, {
        removeComments: options.removeComments ?? true
    });

    const { chunks, imports, statements } = parseResult;

    if (Object.keys(imports).length > 0) {
        Object.entries(imports).forEach(([alias, use]) => {
            const resolved = resolveImport(use, srcPath, options, sys);
            includes[alias] = resolved;
        });
    }

    let toEmit = chunks
        .map((chunk) => {
            if (!isIncludeDirectiveV2(chunk)) return chunk.text;
            return resolveInclude(chunk);
        })
        .join(' ');

    return {
        tokens,
        chunks,
        imports,
        statements,
        toEmit
    };

    function resolveInclude(include: IncludeDirective) {
        const { import: imported, module } = include;

        const resolvedImport = includes[module.text];
        if (!resolvedImport) {
            throw new DiagnosticMessage(
                'Failed to resolve @include.',
                imported.start,
                imported.end
            );
        }

        const resolvedStatement = resolvedImport.statements[imported.text];

        if (!resolvedStatement) {
            throw new DiagnosticMessage(
                'Failed to resolve @include',
                module.start,
                module.end
            );
        }

        // @to-do - add validation here
        return resolvedStatement.bracedExpression
            .map((token) => token.text)
            .join(' ');
    }
}

function readSrcFile(
    srcPath: string,
    srcToken?: UseDirective,
    fileExists = ts.sys.fileExists,
    readFile = ts.sys.readFile
) {
    if (!fileExists(srcPath)) {
        if (srcToken) {
            throw new DiagnosticMessage(
                'Failed to resolve import',
                srcToken.alias.start,
                srcToken.alias.end
            );
        } else {
            throw new Error('Failed to resolve src file.');
        }
    }

    const source = readFile(srcPath);
    if (!source) {
        if (srcToken) {
            throw new DiagnosticMessage(
                'Failed to read file.',
                srcToken.path.start,
                srcToken.path.end
            );
        } else {
            throw new Error('Failed to read src file.');
        }
    }

    return source;
}

function resolveImport(
    directive: UseDirective,
    srcPath: string,
    options: {
        ignoreWhitespace: boolean;
        removeComments: boolean;
    },
    sys?: {
        readFile: typeof ts.sys.readFile;
        fileExists: typeof ts.sys.fileExists;
    }
) {
    const { alias: _alias, path } = directive;

    const srcDir = dirname(srcPath);

    let relativePath = path.text.substring(1, path.text.length - 1);
    if (!relativePath.endsWith('.sasql')) {
        relativePath += '.sasql';
    }

    return parseSourceFile(join(srcDir, relativePath), options, sys, directive);
}
