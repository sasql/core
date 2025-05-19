"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenize = tokenize;
function tokenize(text) {
    const directives = [];
    const comments = [];
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
    function consumeComment() {
        let commentLn = '-';
        let startIndex = index() - 1;
        while (true) {
            let char = chars.shift();
            if (!char) {
                return {
                    startIndex,
                    endIndex: index(),
                    text: commentLn
                };
            }
            if (char === '\n') {
                return {
                    startIndex,
                    endIndex: index(),
                    text: commentLn
                };
            }
            commentLn += char;
        }
    }
    function consumeCommentBlock() {
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
        function isEndOfBlock(char) {
            return char === '*' && chars[0] === '/';
        }
    }
    function consumeDirective() {
        let directive = '';
        let startIndex = index() - 1;
        while (true) {
            let char = chars.shift();
            if (!char) {
                throw new Error('Unexpected end of input.');
            }
            if (char === ';') {
                return { startIndex, endIndex: index(), text: directive };
            }
            directive += char;
        }
    }
    function index() {
        return text.length - chars.length;
    }
}
//# sourceMappingURL=tokenizer.js.map