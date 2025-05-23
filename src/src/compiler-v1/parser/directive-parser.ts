import { dirname, join } from 'path';
import {
    ChunkType,
    CommentBlock,
    IncludeDirective,
    StatementDirective,
    Token,
    UseDirective
} from '../types.js';
import { DiagnosticMessage } from '../diagnostic-message.js';
import { parseSourceFile } from '../parser.js';

export function parseUseDirective(
    srcPath: string,
    token: Token,
    readFile: (...args: any[]) => string | undefined
): UseDirective {
    const split = token.text.split(/\s/g);

    // Remove the required semi-colon at the end of the alias name
    let alias = split[3];
    alias = alias.substring(0, alias.length - 1);

    // Resolve the path relative to the src file
    let path = split[1];
    path = path.substring(1, path.length - 1);
    if (!path.endsWith('.sasql')) path = path + '.sasql';

    const importPath = join(dirname(srcPath), path);
    const importSrc = readFile(importPath, 'utf-8');

    if (!importSrc) {
        throw new DiagnosticMessage(
            'Failed to resolve import.',
            token.startIndex,
            token.endIndex
        );
    }

    const importedSource = parseSourceFile(importSrc, importPath);

    return {
        type: ChunkType.USE_DIRECTIVE,
        sourceFile: importedSource,
        alias,
        startIndex: token.startIndex,
        endIndex: token.endIndex
    };
}

export function parseIncludeDirective(
    token: Token,
    imports: Record<string, UseDirective>
) {
    const _included = token.text
        .substring('@include'.length, token.text.length - 1)
        .trim();

    const [_module, _import] = _included.split('.');

    const resolvedModule = imports[_module];

    if (!resolvedModule) {
        throw new DiagnosticMessage(
            `Cannot resolve import ${_module}.`,
            token.startIndex,
            token.endIndex
        );
    }

    const resolvedStatement = resolvedModule.sourceFile.statements[_import];

    if (!resolvedStatement) {
        throw new DiagnosticMessage(
            `Cannot resolve import ${_import} from ${_module}.`,
            token.startIndex,
            token.endIndex
        );
    }

    const include: IncludeDirective = {
        type: ChunkType.INCLUDE_DIRECTIVE,
        startIndex: token.startIndex,
        endIndex: token.endIndex,
        include: resolvedModule.sourceFile,
        import: _import
    };

    return include;
}

export function parseStatementDirective(
    token: Token,
    docs?: CommentBlock
): StatementDirective {
    const declaration = token.text.substring(0, token.text.indexOf('{')).trim();

    let name = declaration.substring(declaration.indexOf(' ')).trim();

    const stmtStart = token.text.indexOf('{');
    const endIndex = token.text.lastIndexOf('}');

    // @todo - check for interpolations
    const statement = token.text.substring(stmtStart + 1, endIndex);

    return {
        type: ChunkType.STATEMENT_DIRECTIVE,
        name,
        statement,
        startIndex: token.startIndex,
        endIndex: token.endIndex,
        docs
    };
}
