import { Token } from './types.js';

export enum DiagnosticCategory {
    ERROR,
    WARNING,
    INFO
}

export class DiagnosticMessage extends Error {
    public tokenText: string;
    public ln: number;
    public col: number;
    public startIndex: number;
    public endIndex: number;

    constructor(
        messageText: string,
        public category: DiagnosticCategory,
        public source: string,
        public srcPath: string,
        lastToken: Token
    ) {
        super(messageText);

        this.tokenText = lastToken.text;
        this.ln = lastToken.ln;
        this.col = lastToken.col;
        this.startIndex = lastToken.start;
        this.endIndex = lastToken.end;
    }
}
