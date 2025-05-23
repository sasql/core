
export declare interface SourceFile {
    text: string;
    srcPath: string;
    imports: Record<string, UseDirective>;
    included: IncludeDirective[];
    comments: CommentBlock[];
}

export declare interface Position {
    startIndex: number;
    endIndex: number;
}

export declare interface Directive extends Position {
    text: string;
}

export declare interface UseDirective extends Position {
    alias: string;
    sourceFile: SourceFile;
}

export declare interface IncludeDirective extends Position {
    include: string;
}

export declare interface CommentDirective extends Position {
    comment: string;
}

export declare interface TextChunk extends Directive {}

export declare interface CommentBlockRaw extends Directive {}

export declare interface CommentBlock extends Position {
    text?: string;
    tags?: DocTaggedLn[];
}

export declare interface DocTaggedLn {
    tagName: string;
    type: string[];
    paramName: string;
    description: string;
}
