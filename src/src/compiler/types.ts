import type { Range } from 'vscode-languageserver';
import { DiagnosticMessage } from './diagnostic-message.js';
import { SasqlConfig } from './config.js';

export declare interface Position {
    startIndex: number;
    endIndex: number;
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

export declare interface Token extends Range, Position {
    type: TokenType;
    text: string;
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
    module: Token | 'this';
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

export declare interface Compiler {
    /** The source text of the .sasql file. */
    source: string;

    /** The absolute path to the .sasql file. */
    srcPath: string;

    /** The directive that imports this file. */
    srcToken?: UseDirective;

    /** Files imported by this file. */
    imports: Record<string, Compiler>;

    /** Files that imported this file via `@use`. */
    dependants: Record<string, Compiler>;

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

    /** Has this file been compiled? */
    initialized: boolean;

    /**
     * Compiles this file.
     * @param compileImports `true` if files imported via `@use` should be compiled.
     */
    compile(compileImports?: boolean): CompilerOutput;

    recompile(source?: string): CompilerOutput;
}

export declare interface CompilerOutput {
    output: string;
    diagnosticMessages: DiagnosticMessage[];
    unknownExceptions: unknown[];
}

export declare interface CompilerProgramOptions {
    ignoreWhitespace?: boolean;
    removeComments?: boolean;
    entrySource?: string;
    programConfig?: SasqlConfig;
}

export declare interface CompilerProgram {
    compilers: Map<string, Compiler>;
    compileProject: () => {
        output: Record<string, string>;
        diagnosticMessages: DiagnosticMessage[];
        unknownExceptions: unknown[];
    };
}
