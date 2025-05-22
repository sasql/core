import { Range } from 'vscode-languageserver';
import { Position, Token } from './types.js';

export enum DiagnosticCategory {
    ERROR = 1,
    WARNING = 2,
    INFORMATION = 3,
    HINT = 4
}

export class DiagnosticMessage extends Error {
    public tokenText: string;
    public range: Range;
    public position: Position;

    constructor(
        messageText: string,
        public category: DiagnosticCategory,
        public source: string,
        public srcPath: string,
        lastToken: Token
    ) {
        super(messageText);

        this.tokenText = lastToken.text;
        this.range = {
            start: lastToken.start,
            end: lastToken.end
        };
        this.position = {
            startIndex: lastToken.startIndex,
            endIndex: lastToken.endIndex
        };
    }
}
