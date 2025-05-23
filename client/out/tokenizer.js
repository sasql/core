"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenize = tokenize;
const doc_parser_1 = require("./doc-parser");
function tokenize(text) {
    const directives = [];
    const comments = [];
    const chars = [...text];
    while (true) {
        let char = chars.shift();
        if (char === '-' && char[0] === '-') {
            directives.push(consumeComment());
            continue;
        }
        if (char === '/' && chars[0] === '*' && chars[1] === '*') {
            const block = consumeCommentBlock();
            comments.push(block);
        }
        if (char === undefined) {
            return directives;
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
        let commentText = '';
        let tagLns = [];
        while (true) {
            let char = chars.shift();
            if (!char || isEndOfBlock(char)) {
                const commentBlock = {
                    startIndex: start,
                    endIndex: index()
                };
                if (commentText.length > 0) {
                    commentBlock.text = commentText;
                }
                if (tagLns.length > 0) {
                    commentBlock.tags = tagLns;
                }
                return commentBlock;
            }
            if (char === '@') {
                const taggedLn = consumeDocTag();
                if (taggedLn)
                    tagLns.push(taggedLn);
                continue;
            }
            if (char !== '*') {
                commentText += char;
            }
        }
        function consumeDocTag() {
            let taggedLn = '@';
            while (true) {
                let char = chars.shift();
                if (!char || char === '@' || isEndOfBlock(char)) {
                    if (char)
                        chars.unshift(char);
                    return (0, doc_parser_1.parseDocTagLn)(taggedLn);
                }
                taggedLn += char;
            }
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