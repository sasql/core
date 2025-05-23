import { TokenType, type Token } from './types.js';

export function tokenize(text: string) {
    const chunks: Token[] = [];

    const chars = [...text];

    let thisChunk = '';
    let start = index();

    while (true) {
        let char = chars.shift();

        if (char === undefined) {
            if (thisChunk.length > 0) {
                chunks.push({
                    type: TokenType.TEXT_CHUNK,
                    text: thisChunk,
                    startIndex: start,
                    endIndex: index()
                });
            }
            return chunks;
        }

        if (char === '-' && char[0] === '-') {
            pushChunk();
            chunks.push(consumeComment());
            start = index();
            continue;
        }

        if (char === '/' && chars[0] === '*') {
            pushChunk();
            chunks.push(consumeCommentBlock());
            start = index();
            continue;
        }

        if (char === '@') {
            pushChunk();
            chunks.push(consumeDirective());
            start = index();
            continue;
        }

        thisChunk += char;
    }

    function pushChunk() {
        if (thisChunk.length > 0) {
            chunks.push({
                type: TokenType.TEXT_CHUNK,
                text: thisChunk,
                startIndex: start,
                endIndex: index() - 1
            });

            thisChunk = '';
        }
    }

    function consumeComment(): Token {
        let commentLn = '-';

        let startIndex = index() - 1;

        while (true) {
            let char = chars.shift();

            if (!char) {
                return {
                    type: TokenType.COMMENT,
                    text: commentLn,
                    startIndex,
                    endIndex: index()
                };
            }

            if (char === '\n') {
                return {
                    type: TokenType.COMMENT,
                    text: commentLn,
                    startIndex,
                    endIndex: index()
                };
            }

            commentLn += char;
        }
    }

    function consumeCommentBlock(): Token {
        let start = index();

        let blockText = '';

        while (true) {
            let char = chars.shift();

            if (!char) {
                return {
                    type: TokenType.COMMENT_BLOCK,
                    text: blockText,
                    startIndex: start,
                    endIndex: index()
                };
            }

            blockText += char;

            if (char === '*' && chars[0] === '/') {
                blockText += chars.shift(); // Remove the final '/'

                if (/\s/.test(chars[0])) {
                    blockText += chars.shift();
                }

                return {
                    type: TokenType.COMMENT_BLOCK,
                    text: blockText,
                    startIndex: start,
                    endIndex: index()
                };
            }
        }
    }

    function consumeDirective(): Token {
        let directive: string = '@';

        let startIndex = index() - 1;

        while (true) {
            let char = chars.shift();

            if (!char) {
                throw new Error('Unexpected end of input.');
            }

            if (char === ' ') {
                if (directive === '@statement') {
                    return consumeBracedDirective(directive + char, startIndex);
                }
            }

            directive += char;

            if (char === ';') {
                return {
                    type: TokenType.DIRECTIVE,
                    text: directive,
                    startIndex,
                    endIndex: index()
                };
            }
        }
    }

    function consumeBracedDirective(
        directive: string,
        startIndex: number
    ): Token {
        let depth = 0;

        while (true) {
            let char = chars.shift();

            if (!char) {
                throw new Error('Unexpected end of input.');
            }

            if (depth === 1 && char === '}') {
                return {
                    type: TokenType.DIRECTIVE,
                    text: directive + char,
                    startIndex,
                    endIndex: index()
                };
            } else if (char === '}') {
                depth -= 1;
            }

            if (char === '{') {
                depth += 1;
            }

            directive += char;
        }
    }

    function index() {
        return text.length - chars.length;
    }
}
