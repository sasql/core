import { DiagnosticMessage } from '../compiler/diagnostic-message.js';
import { Token, TokenType } from './types.js';

export function tokenize(
    text: string,
    options: {
        tokenizeWhitespace?: boolean;
    } = {}
) {
    const tokens: Token[] = [];

    let ln = 1;
    let col = 1;
    let start: number;

    let tokenizeWhitespace = options.tokenizeWhitespace ?? true;
    let specialRegex = /[{}()[\]\\\/;*=.]/;

    const chars = [...text];

    while (true) {
        let char = shift();
        if (!char) return tokens;

        start = index();

        if (/\s/.test(char)) {
            const ws = consumeWhitespace(char);
            if (tokenizeWhitespace) {
                tokens.push(ws);
            }
            continue;
        }

        if (char === '@') {
            tokens.push(consumeWord(char, TokenType.DIRECTIVE));
            continue;
        }

        if (char === '-' && chars[0] === '-') {
            tokens.push(consumeLine(char, TokenType.COMMENT_LN));
        }

        if (/[a-z_]/.test(char)) {
            tokens.push(consumeWord(char, TokenType.TEXT));
            continue;
        }

        if (/[0-9]/.test(char)) {
            tokens.push(consumeWord(char, TokenType.NUMBER));
            continue;
        }

        if (/[$]/.test(char)) {
            tokens.push(consumeWord(char, TokenType.VARIABLE));
            continue;
        }

        if (/['"]/.test(char)) {
            tokens.push(consumeQuotedString(char));
            continue;
        }

        if (specialRegex.test(char)) {
            tokens.push(consumeSpecial(char));
            continue;
        }

        tokens.push(consumeWord(char, TokenType.TEXT));
    }

    function shift() {
        const char = chars.shift();
        if (!char) return;

        if (char === '\n') {
            ln += 1;
            col = 1;
        } else {
            col += char.length;
        }

        return char;
    }

    function index() {
        return text.length - chars.length;
    }

    function consumeWhitespace(text: string): Token {
        const _ln = ln;
        const _col = col;
        const _start = start - 1;

        while (true) {
            let char = shift();

            if (!char || !/\s/.test(char)) {
                if (char) chars.unshift(char);
                return {
                    text,
                    type: TokenType.WHITESPACE,
                    ln: _ln,
                    col: _col,
                    start: _start,
                    end: index()
                };
            }

            text += char;
        }
    }

    function consumeLine(text: string, lineType: TokenType): Token {
        const _ln = ln;
        const _col = col;
        const _start = start - 1;

        while (true) {
            if (!chars[0] || /\n|\r/.test(chars[0])) {
                return {
                    text,
                    type: lineType,
                    ln: _ln,
                    col: _col,
                    start: _start,
                    end: index()
                };
            }

            text += shift()!;
        }
    }

    function consumeWord(text: string, type: TokenType): Token {
        const _ln = ln;
        const _col = col;
        const _start = start - 1;

        while (true) {
            if (
                !chars[0] ||
                /\s/.test(chars[0]) ||
                specialRegex.test(chars[0])
            ) {
                return {
                    text,
                    type,
                    ln: _ln,
                    col: _col,
                    start: _start,
                    end: index()
                };
            }

            text += shift()!;
        }
    }

    function consumeSpecial(text: string): Token {
        const _ln = ln;
        const _col = col;
        const _start = start - 1;

        while (true) {
            if (
                !chars[0] ||
                /\s/.test(chars[0]) ||
                !specialRegex.test(chars[0])
            ) {
                return {
                    text,
                    type: TokenType.PUNCTUATION,
                    ln: _ln,
                    col: _col,
                    start: _start,
                    end: index()
                };
            }

            text += shift()!;
        }
    }

    function consumeQuotedString(text: string): Token {
        const _ln = ln;
        const _col = col;
        const _start = start - 1;

        while (true) {
            const char = shift()!;

            if (!char) {
                throw new DiagnosticMessage(
                    'Unterminated string',
                    _start,
                    index()
                );
            }

            text += char;

            if (
                (text.startsWith('"') && char === '"') ||
                (text.startsWith("'") && char === "'")
            ) {
                return {
                    text: text,
                    type: TokenType.STRING,
                    ln: _ln,
                    col: _col,
                    start: _start,
                    end: index()
                };
            }
        }
    }
}
