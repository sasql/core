"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseSourceFile = parseSourceFile;
const tokenizer_1 = require("./tokenizer");
const directive_parser_1 = require("./directive-parser");
function parseSourceFile(text, srcPath) {
    try {
        const { directives, comments } = (0, tokenizer_1.tokenize)(text);
        return (0, directive_parser_1.parseDirectives)(text, srcPath, directives, comments);
    }
    catch (e) {
        console.error(e);
        throw e;
    }
}
//# sourceMappingURL=parser.js.map