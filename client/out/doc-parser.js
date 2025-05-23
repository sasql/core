"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDocTagLn = parseDocTagLn;
function parseDocTagLn(ln) {
    ln = ln.trim();
    if (ln.endsWith('*'))
        ln = ln.substring(0, ln.length - 2);
    const tagName = ln.substring(0, ln.indexOf(' '));
    if (tagName === '@param') {
        return parseParamDocTag();
    }
    else {
        console.error('Unknown doc tag encountered ' + tagName);
    }
    function parseParamDocTag() {
        const type = ln
            .substring(ln.indexOf('{') + 1, ln.indexOf('}'))
            .split(/\|/g)
            .map((type) => type.trim());
        let rest = ln.substring(ln.indexOf('}') + 1).trim();
        const paramName = rest.substring(0, rest.indexOf(' '));
        rest = rest.substring(rest.indexOf(' ')).trim();
        if (rest.startsWith('-')) {
            rest = rest.substring(1).trim();
        }
        return {
            tagName,
            type,
            paramName,
            description: rest
        };
    }
}
//# sourceMappingURL=doc-parser.js.map