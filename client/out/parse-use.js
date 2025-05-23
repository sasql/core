"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseSourceFile = parseSourceFile;
const tokenizer_1 = require("./tokenizer");
const directive_parser_1 = require("./directive-parser");
function parseSourceFile(text, srcPath) {
    const directives = (0, tokenizer_1.tokenize)(text);
    return (0, directive_parser_1.parseDirectives)(text, srcPath, directives);
}
//# sourceMappingURL=parse-use.js.map