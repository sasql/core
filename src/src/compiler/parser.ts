import { DiagnosticCategory, DiagnosticMessage } from './diagnostic-message.js';
import {
    TokenType,
    Token,
    ParseResult,
    UseDirective,
    StatementDirective,
    IncludeDirective,
    CommentBlock,
    DocTag
} from './types.js';

export function parse(
    _tokens: Token[],
    source: string,
    srcPath: string,
    options: {
        removeComments?: boolean;
    } = {}
): ParseResult {
    let removeComments = options.removeComments ?? true;

    let tokens = [..._tokens];

    const imports: Record<string, UseDirective> = {};
    const statements: Record<string, StatementDirective> = {};
    const chunks: (Token | IncludeDirective)[] = [];
    const diagnosticMessages: DiagnosticMessage[] = [];
    const unknownExceptions: unknown[] = [];

    while (true) {
        let token = tokens.shift();
        if (!token) {
            return {
                chunks,
                imports,
                statements,
                diagnosticMessages,
                unknownExceptions
            };
        }

        if (token.type === TokenType.COMMENT_LN) {
            if (removeComments === false) {
                chunks.push(token);
            }
            continue;
        }

        if (token.type === TokenType.DIRECTIVE) {
            parseDirective(token);
            continue;
        }

        if (token.text === '/**') {
            const block = parseCommentBlock(token);

            if (tokens[0].type === TokenType.DIRECTIVE) {
                parseDirective(tokens.shift()!, block);
            }
            continue;
        }

        chunks.push(token);
    }

    function parseDirective(token: Token, commentBlock?: any) {
        const { text } = token;

        try {
            switch (text) {
                case '@use':
                    const use = parseUseDirective(token);
                    imports[use.alias.text] = use;
                    break;
                case '@include':
                    const include = parseIncludeDirective(token);
                    chunks.push(include);
                    break;
                case '@statement':
                    const stmt = parseStatementDirective(token, commentBlock);
                    statements[stmt.stmtName.text] = stmt;
                    break;
                default:
                    // This isn't a directive
                    chunks.push(token);
            }
        } catch (e) {
            onError(e);
        }
    }

    function formatDiagnosticMessage(
        startToken: Token,
        expected: string,
        receivedToken?: Token,
        receivedField: keyof Token = 'text'
    ) {
        let errorMessage = `Expected ${expected}`;

        if (receivedToken) {
            errorMessage += ', received ' + receivedToken[receivedField] + '.';
        } else {
            errorMessage += ', received undefined.';
        }

        return new DiagnosticMessage(
            errorMessage,
            DiagnosticCategory.ERROR,
            source,
            srcPath,
            startToken
        );
    }

    function onError(e: unknown) {
        if (e instanceof DiagnosticMessage) {
            diagnosticMessages.push(e);
        } else {
            unknownExceptions.push(e);
        }
    }

    function parseUseDirective(token: Token): UseDirective {
        const path = tokens.shift();
        if (!path || path.type !== TokenType.STRING) {
            throw formatDiagnosticMessage(token, 'import path', path);
        }

        const asKW = tokens.shift();
        if (!asKW || asKW.text.toLowerCase() !== 'as') {
            throw formatDiagnosticMessage(token, 'as', asKW);
        }

        const alias = tokens.shift();
        if (!alias || alias.type !== TokenType.TEXT) {
            throw formatDiagnosticMessage(token, 'import alias', alias);
        }

        const close = tokens.shift();
        if (!close || close.text !== ';') {
            throw formatDiagnosticMessage(token, ';', close);
        }

        return { path, alias };
    }

    function parseIncludeDirective(token: Token): IncludeDirective {
        const _module = tokens.shift();
        if (!_module || _module.type !== TokenType.TEXT) {
            throw formatDiagnosticMessage(token, '@use alias', _module);
        }

        const sep = tokens.shift();
        if (!sep || sep.text !== '.') {
            throw formatDiagnosticMessage(token, '.', sep);
        }

        const _import = tokens.shift();
        if (!_import || _import.type !== TokenType.TEXT) {
            throw formatDiagnosticMessage(token, '@use import', _import);
        }

        const _close = tokens.shift();
        if (!_close || _close.text !== ';') {
            throw formatDiagnosticMessage(token, ';', _close);
        }

        return {
            module: _module,
            import: _import
        };
    }

    function parseStatementDirective(
        token: Token,
        commentBlock?: any
    ): StatementDirective {
        const stmtName = tokens.shift();
        if (!stmtName || stmtName.type !== TokenType.TEXT) {
            throw formatDiagnosticMessage(token, '@statement name', stmtName);
        }

        const openBrace = tokens.shift();
        if (!openBrace || openBrace.text !== '{') {
            throw formatDiagnosticMessage(token, '{', openBrace);
        }

        let bracedExpression: Token[];

        try {
            bracedExpression = parseBracedExpression(openBrace);
        } catch (e) {
            onError(e);
            bracedExpression = [];
        }

        return {
            stmtName,
            bracedExpression,
            commentBlock
        };
    }

    function parseBracedExpression(token: Token): Token[] {
        const expressionTokens: Token[] = [];

        let depth = 0;
        while (true) {
            let nextToken = tokens.shift();

            if (!nextToken) {
                throw new DiagnosticMessage(
                    'Braced expression not terminated',
                    DiagnosticCategory.ERROR,
                    source,
                    srcPath,
                    token
                );
            }

            if (depth === 0 && nextToken.text === '}') {
                return expressionTokens;
            } else if (nextToken.text === '}') {
                depth -= 1;
            } else if (nextToken.text === '{') {
                depth += 1;
            }

            expressionTokens.push(nextToken);
        }
    }

    function parseCommentBlock(token: Token): CommentBlock {
        const commentTokens: Token[] = [];
        const tags: any[] = [];

        while (true) {
            let nextToken = tokens.shift();
            if (!nextToken) {
                throw new DiagnosticMessage(
                    'Unterminated comment block',
                    DiagnosticCategory.ERROR,
                    source,
                    srcPath,
                    token
                );
            }

            if (nextToken.text === '*/') {
                return { description: commentTokens, tags };
            }

            if (nextToken.text === '*') {
                continue;
            }

            if (nextToken.text.startsWith('@')) {
                try {
                    tags.push(parseDocTag(nextToken));
                } catch (e) {
                    onError(e);
                }
                continue;
            }

            commentTokens.push(nextToken);
        }

        function parseDocTag(tag: Token): DocTag {
            let tagType: Token[] | undefined;
            let tagParam: Token | undefined;
            let tagDescription: Token[] | undefined;

            while (true) {
                if (!tokens[0]) {
                    throw new DiagnosticMessage(
                        'Unterminated comment block.',
                        DiagnosticCategory.WARNING,
                        source,
                        srcPath,
                        tag
                    );
                }

                if (tokens[0].text.startsWith('@') || tokens[0].text === '*/') {
                    return { tag, tagType, tagParam, tagDescription };
                }

                let nextToken = tokens.shift()!;

                if (nextToken.text === '{') {
                    tagType = parseBracedExpression(nextToken).filter(
                        (t) => t.text !== '|'
                    );

                    tagParam = tokens.shift();
                    continue;
                }

                tagDescription?.push(nextToken);
            }
        }
    }
}
