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
            start: {
                character: lastToken.start.character - 1,
                line: lastToken.start.line - 1
            },
            end: {
                character: lastToken.end.character - 1,
                line: lastToken.end.line - 1
            }
        };
        this.position = {
            startIndex: lastToken.startIndex,
            endIndex: lastToken.endIndex
        };
    }
}
