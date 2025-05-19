"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDirectives = parseDirectives;
const path_1 = require("path");
const fs_1 = require("fs");
const parser_1 = require("./parser");
/**
 * @param text The src text of the SQL file
 * @param srcPath The src path of the SQL file
 * @param directives The directives parsed from `src`
 */
function parseDirectives(text, srcPath, directives) {
    const imports = {};
    const included = [];
    const comments = [];
    directives.forEach((directive) => {
        const directiveText = text.substring(directive.startIndex, directive.endIndex);
        if (directiveText.startsWith('-')) {
            const comment = parseCommentDirective(directive, directiveText);
            comments.push(comment);
            return;
        }
        if (directiveText.startsWith('@use')) {
            const use = parseUseDirective(directive, directiveText, srcPath);
            imports[use.alias] = use;
            return;
        }
        if (directiveText.startsWith('@include')) {
            const _included = directiveText
                .substring('@include'.length, directiveText.length - 1)
                .trim();
            const interpolation = imports[_included];
            if (!interpolation) {
                throw new Error(`Cannot resolve import ${_included}.`);
            }
            included.push({
                include: _included,
                startIndex: directive.startIndex,
                endIndex: directive.endIndex
            });
        }
    });
    return { text, srcPath, imports, included, comments };
}
/**
 * @param directive A directive identified as a `use` directive
 * @param directiveText The directive text
 */
function parseUseDirective(directive, directiveText, srcPath) {
    const split = directiveText.split(/\s/g);
    // Remove the required semi-colon at the end of the alias name
    let alias = split[3];
    alias = alias.substring(0, alias.length - 1);
    // Resolve the path relative to the src file
    let path = split[1];
    path = path.substring(1, path.length - 1);
    if (!path.endsWith('.sasql'))
        path = path + '.sasql';
    const importPath = (0, path_1.join)((0, path_1.dirname)(srcPath), path);
    const importSrc = (0, fs_1.readFileSync)(importPath, 'utf-8');
    const importedSource = (0, parser_1.parseSourceFile)(importSrc, importPath);
    return {
        sourceFile: importedSource,
        alias,
        startIndex: directive.startIndex,
        endIndex: directive.endIndex
    };
}
function parseCommentDirective(directive, directiveText) {
    return {
        startIndex: directive.startIndex,
        endIndex: directive.endIndex,
        comment: directiveText
    };
}
//# sourceMappingURL=directive-parser.js.map