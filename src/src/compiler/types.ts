import { DiagnosticMessage } from './diagnostic-message.js';

export declare interface SourceFile {
    text: string;
    srcPath: string;
    imports: Record<string, UseDirective>;
    chunks: (
        | TextChunk
        | IncludeDirective
        | CommentBlock
        | StatementDirective
    )[];
    statements: Record<string, StatementDirective>;
    diagnosticMessages: DiagnosticMessage[];
}

export declare interface Output {
    source: SourceFile;
    emit: string;
    sourceMap: SourceMapEntry[];
    diagnostics: DiagnosticMessage[];
}

export declare interface Position {
    startIndex: number;
    endIndex: number;
}

export declare interface Source extends Position {
    path: string;
}

export declare interface SourceMapEntry {
    local: Source;
    remote: Source;
}

//
// Token
//

export enum TokenType {
    TEXT_CHUNK,
    DIRECTIVE,
    COMMENT_BLOCK,
    COMMENT
}

export declare interface Token extends Position {
    type: TokenType;
    text: string;
}

//
// Chunk
//

export enum ChunkType {
    USE_DIRECTIVE,
    INCLUDE_DIRECTIVE,
    STATEMENT_DIRECTIVE,
    COMMENT_BLOCK,
    TEXT_CHUNK
}

export declare interface Chunk extends Position {
    type: ChunkType;
}

export declare interface TextChunk extends Chunk {
    type: ChunkType.TEXT_CHUNK;
    text: string;
}

export declare interface UseDirective extends Chunk {
    type: ChunkType.USE_DIRECTIVE;
    alias: string;
    sourceFile: SourceFile;
}

export declare interface IncludeDirective extends Chunk {
    type: ChunkType.INCLUDE_DIRECTIVE;
    include: SourceFile;
    import: string;
}

export declare interface StatementDirective extends Chunk {
    type: ChunkType.STATEMENT_DIRECTIVE;
    name: string;
    statement: string;
}

export declare interface CommentBlock extends Position {
    type: ChunkType.COMMENT_BLOCK;
    text?: string;
    tags?: DocTaggedLn[];
}

export declare interface DocTaggedLn {
    tagName: string;
    type: string[];
    paramName: string;
    description: string;
}
