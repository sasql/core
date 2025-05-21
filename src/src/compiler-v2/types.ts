import { DiagnosticMessage } from './diagnostic-message.js';

export declare interface Position {
    startIndex: number;
    endIndex: number;
    ln: number;
    col: number;
}

export enum TokenType {
    DIRECTIVE,
    PUNCTUATION,
    WHITESPACE,
    COMMENT_BLOCK,
    COMMENT_LN,
    TEXT,
    STRING,
    NUMBER,
    VARIABLE,
    UNKNOWN
}

export declare interface Token {
    type: TokenType;
    text: string;
    ln: number;
    col: number;
    start: number;
    end: number;
}

export declare interface ParseResult {
    imports: Record<string, UseDirective>;
    statements: Record<string, StatementDirective>;
    chunks: (Token | IncludeDirective)[];
    diagnosticMessages: DiagnosticMessage[];
    unknownExceptions: unknown[];
}

export declare interface UseDirective {
    path: Token;
    alias: Token;
}

export declare interface IncludeDirective {
    module: Token;
    import: Token;
}

export function isIncludeDirectiveV2(val: any): val is IncludeDirective {
    return (
        val !== null && val !== undefined && 'module' in val && 'import' in val
    );
}

export declare interface StatementDirective {
    stmtName: Token;
    bracedExpression: Token[];
    commentBlock?: CommentBlock;
}

export declare interface CommentBlock {
    description: Token[];
    tags: DocTag[];
}

export declare interface DocTag {
    tag: Token;
    tagType?: Token[];
    tagParam?: Token;
    tagDescription?: Token[];
}
