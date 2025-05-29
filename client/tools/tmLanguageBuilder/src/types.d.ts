export declare interface CaptureGroup {
    name: string;
    captures: Capture[];
}

export declare interface Capture {
    regex: string;
    name?: string;
}

export declare type DirectiveType = 'use' | 'include' | 'statement';