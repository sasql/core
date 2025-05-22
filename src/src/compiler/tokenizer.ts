import { Range } from 'vscode-languageserver';
import { DiagnosticCategory, DiagnosticMessage } from './diagnostic-message.js';
import { Position, Token, TokenType } from './types.js';

export declare interface TokinizationResult {
    tokens: Token[];
    diagnosticMessages: DiagnosticMessage[];
}

export function tokenize(
    source: string,
    srcPath: string,
    options: { ignoreWhitespace?: boolean } = {}
): TokinizationResult {
    const tokens: Token[] = [];
    const diagnosticMessages: DiagnosticMessage[] = [];

    let ln = 1;
    let col = 1;
    let start: number;

    let ignoreWhitespace = options.ignoreWhitespace ?? true;
    let specialRegex = /[{}()[\]\\\/;*=.]/;

    const chars = [...source];

    while (true) {
        let char = shift();
        if (!char) return { tokens, diagnosticMessages };

        start = index();

        if (/\s/.test(char)) {
            const ws = consumeWhitespace(char);
            if (!ignoreWhitespace) {
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

    function unshift(char: string) {
        chars.unshift(char);
        if (char === '\n') {
            ln -= 1;
        }
        col = col - 1;
    }

    function index() {
        return source.length - chars.length;
    }

    function consumeWhitespace(text: string): Token {
        const range = initRange();

        while (true) {
            let char = shift();

            if (!char || !/\s/.test(char)) {
                if (char) unshift(char);
                return {
                    text,
                    type: TokenType.WHITESPACE,
                    ...range.lock()
                };
            }

            text += char;
        }
    }

    function consumeLine(text: string, lineType: TokenType): Token {
        const range = initRange();

        while (true) {
            if (!chars[0] || /\n|\r/.test(chars[0])) {
                return {
                    text,
                    type: lineType,
                    ...range.lock()
                };
            }

            text += shift()!;
        }
    }

    function consumeWord(text: string, type: TokenType): Token {
        const range = initRange();

        while (true) {
            if (
                !chars[0] ||
                /\s/.test(chars[0]) ||
                specialRegex.test(chars[0])
            ) {
                return { text, type, ...range.lock() };
            }

            text += shift()!;
        }
    }

    function consumeSpecial(text: string): Token {
        const range = initRange();

        while (true) {
            if (
                !chars[0] ||
                /\s/.test(chars[0]) ||
                !specialRegex.test(chars[0])
            ) {
                return { text, type: TokenType.PUNCTUATION, ...range.lock() };
            }

            text += shift()!;
        }
    }

    function consumeQuotedString(text: string): Token {
        const range = initRange();

        while (true) {
            const char = shift()!;

            if (!char) {
                diagnosticMessages.push(
                    new DiagnosticMessage(
                        'Unterminated string',
                        DiagnosticCategory.ERROR,
                        text,
                        srcPath,
                        {
                            text,
                            type: TokenType.UNKNOWN,
                            ...range.lock()
                        }
                    )
                );

                return {
                    text: text,
                    type: TokenType.STRING,
                    ...range.lock()
                };
            }

            text += char;

            if (
                (text.startsWith('"') && char === '"') ||
                (text.startsWith("'") && char === "'")
            ) {
                return {
                    text: text,
                    type: TokenType.STRING,
                    ...range.lock()
                };
            }
        }
    }

    function initRange(offset = 1): { lock: () => Range & Position } {
        const startCol = col;
        const startLn = ln;
        const startIndex = start - offset;

        return {
            lock: () => {
                return {
                    startIndex,
                    endIndex: index(),
                    start: {
                        character: startCol - offset,
                        line: startLn
                    },
                    end: {
                        character: col,
                        line: ln
                    }
                };
            }
        };
    }
}
