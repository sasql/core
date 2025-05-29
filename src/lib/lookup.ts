import { Token } from './types.js';

export class TokenPosnMap extends Map<number, SourceLine> {
    getAtPosn(ln: number, char: number) {
        if (!this.has(ln)) {
            return null;
        }
        return this.get(ln)!.findTokenAt(char);
    }

    public push(token: Token) {
        const ln = token.start.line;

        if (!this.has(ln)) {
            const map = new SourceLine(token);
            this.set(ln, map);
        }
        return this.get(ln)!.push(token);
    }
}

export class SourceLine extends Array<Token> {
    findTokenAt(char: number) {
        return this.find((token) => {
            token.start.character <= char && token.end.character >= char;
        });
    }
}
