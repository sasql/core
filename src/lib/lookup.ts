import { Range } from 'vscode-languageserver';
import {
    IncludeDirective,
    isIncludeDirective,
    isToken,
    isUseDirective,
    StatementDirective,
    Token,
    UseDirective
} from './types.js';

export declare type Positional =
    | Token
    | UseDirective
    | IncludeDirective
    | StatementDirective;

export class TokenPosnMap extends Map<number, SourceLine> {
    public push(token: Positional) {
        const ln = getPositionalRange(token).start.line;

        if (!this.has(ln)) {
            const lineMap = new SourceLine(token);
            this.set(ln, lineMap);
            return lineMap.length;
        }
        return this.get(ln)!.push(token);
    }

    public getAtPosn(ln: number, char: number) {
        if (!this.has(ln)) {
            return null;
        }
        return this.get(ln)!.findTokenAt(char);
    }
}

export class SourceLine extends Array<Positional> {
    findTokenAt(char: number): Positional | undefined {
        let i = 0;
        while (true) {
            let token = this[i++];
            if (!token) return;

            const range = getPositionalRange(token);

            if (range.start.character <= char && range.end.character >= char) {
                return token;
            }
        }
    }
}

function getPositionalRange(token: Positional): Range {
    if (isToken(token)) {
        return {
            start: token.start,
            end: token.end
        };
    }

    if (isIncludeDirective(token)) {
        return {
            start: (!token.module ? token.import : token.module).start,
            end: token.import.end
        };
    }

    if (isUseDirective(token)) {
        return {
            start: token.path.start,
            end: token.alias.end
        };
    }

    // implied `if (isStatementDirective(token))`
    return {
        start: token.stmtName.start,
        end: token.bracedExpression[token.bracedExpression.length - 1].end
    };
}
