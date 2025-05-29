import { CommentBlockRaw, Directive } from './types';

export function tokenize(text: string) {
    const directives: Directive[] = [];
    const comments: CommentBlockRaw[] = [];

    const chars = [...text];

    while (true) {
        let char = chars.shift();

        if (char === undefined) {
            return { directives, comments };
        }

        if (char === '-' && char[0] === '-') {
            directives.push(consumeComment());
            continue;
        }

        if (char === '/' && chars[0] === '*') {
            const block = consumeCommentBlock();
            comments.push(block);
            continue;
        }

        if (char === '@') {
            directives.push(consumeDirective());
            continue;
        }
    }

    function consumeComment(): Directive {
        let commentLn = '-';

        let startIndex = index() - 1;

        while (true) {
            let char = chars.shift();

            if (!char) {
                return {
                    startIndex: startIndex,
                    endIndex: index(),
                    text: commentLn
                };
            }

            if (char === '\n') {
                return {
                    startIndex: startIndex,
                    endIndex: index(),
                    text: commentLn
                };
            }

            commentLn += char;
        }
    }

    function consumeCommentBlock(): CommentBlockRaw {
        let start = index();

        let blockText = '';

        while (true) {
            let char = chars.shift();

            if (!char) {
                return {
                    startIndex: start,
                    endIndex: index(),
                    text: blockText
                };
            }

            if (isEndOfBlock(char)) {
                chars.shift(); // Remove the final '/'
                return {
                    startIndex: start,
                    endIndex: index() + 1,
                    text: blockText
                };
            }

            blockText += char;
        }

        function isEndOfBlock(char: string) {
            return char === '*' && chars[0] === '/';
        }
    }

    function consumeDirective(): Directive {
        let directive: string = '';

        let startIndex = index() - 1;

        while (true) {
            let char = chars.shift();

            if (!char) {
                throw new Error('Unexpected end of input.');
            }

            if (char === ';') {
                return { startIndex: startIndex, endIndex: index(), text: directive };
            }

            directive += char;
        }
    }

    function index() {
        return text.length - chars.length;
    }
}
