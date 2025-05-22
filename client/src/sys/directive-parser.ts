import { dirname, join } from 'path';
import {
    CommentBlock,
    CommentBlockRaw,
    CommentDirective,
    Directive,
    IncludeDirective,
    SourceFile,
    UseDirective
} from './types';
import { readFileSync } from 'fs';
import { parseSourceFile } from './parser';
import { parseCommentBlock } from './doc-parser';

/**
 * @param text The src text of the SQL file
 * @param srcPath The src path of the SQL file
 * @param directives The directives parsed from `src`
 */
export function parseDirectives(
    text: string,
    srcPath: string,
    directives: Directive[],
    rawComments: CommentBlockRaw[]
): SourceFile {
    const imports: Record<string, UseDirective> = {};
    const included: IncludeDirective[] = [];
    const comments: CommentBlock[] = [];

    rawComments.forEach((commentBlock) => {
        comments.push(parseCommentBlock(commentBlock));
    });

    directives.forEach((directive) => {
        const directiveText = text.substring(
            directive.start.character,
            directive.end.character
        );

        if (directiveText.startsWith('-')) {
            // @to-do - do we want to parse standard comments
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
                start: directive.start,
                end: directive.end
            });
        }
    });

    return { text, srcPath, imports, included, comments };
}

/**
 * @param directive A directive identified as a `use` directive
 * @param directiveText The directive text
 */
function parseUseDirective(
    directive: Directive,
    directiveText: string,
    srcPath: string
): UseDirective {
    const split = directiveText.split(/\s/g);

    // Remove the required semi-colon at the end of the alias name
    let alias = split[3];
    alias = alias.substring(0, alias.length - 1);

    // Resolve the path relative to the src file
    let path = split[1];
    path = path.substring(1, path.length - 1);
    if (!path.endsWith('.sasql')) path = path + '.sasql';

    const importPath = join(dirname(srcPath), path);
    const importSrc = readFileSync(importPath, 'utf-8');

    const importedSource = parseSourceFile(importSrc, importPath);

    return {
        sourceFile: importedSource,
        alias,
        start: directive.start,
        end: directive.end
    };
}

function parseCommentDirective(
    directive: Directive,
    directiveText: string
): CommentDirective {
    return {
        start: directive.start,
        end: directive.end,
        comment: directiveText
    };
}
