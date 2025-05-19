"use strict";
// import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
// import { basename, dirname, join } from 'path';
// import type {
//     CommentDirective,
//     Directive,
//     IncludeDirective,
//     TextChunk,
//     UseDirective
// } from './types';
// import chalk from 'chalk';
// import { exit } from 'process';
Object.defineProperty(exports, "__esModule", { value: true });
// export function createBuilder({
//     formatOptions,
//     include,
//     outDir
// }: ProgramConfiguration) {
//     if (!existsSync(outDir)) {
//         try {
//             mkdirSync(outDir, { recursive: true });
//         } catch {
//             console.error(chalk.red('Failed to create outdir at ' + outDir));
//             exit();
//         }
//     }
//     return include.map((src) => {
//         const srcFile = readFileSync(src, 'utf-8');
//         return builder(srcFile, src, outDir);
//     });
// }
// /**
//  * @param src The source text of a sasql file
//  * @param srcPath The absolute path to `src`
//  * @param outDir The out directory of the compilation
//  * @param formatOptions The format options for the compilation
//  */
// export function builder(src: string, srcPath: string, outDir?: string) {
//     const rawDirectives = tokenize();
//     return parseDirectives(rawDirectives);
//     function tokenize() {
//         const directives: Directive[] = [];
//         const chars = [...src];
//         while (true) {
//             let char = chars.shift();
//             if (char === '-' && char[0] === '-') {
//                 directives.push(consumeComment());
//                 continue;
//             }
//             if (char === undefined) {
//                 return directives;
//             }
//             if (char === '@') {
//                 directives.push(consumeDirective());
//                 continue;
//             }
//         }
//         function consumeComment(): Directive {
//             let commentLn = '-';
//             let startIndex = index() - 1;
//             while (true) {
//                 let char = chars.shift();
//                 if (!char || char === '\n') {
//                     return {
//                         startIndex,
//                         endIndex: index(),
//                         text: commentLn
//                     };
//                 }
//                 commentLn += char;
//             }
//         }
//         function consumeDirective(): Directive {
//             let directive: string = '';
//             let startIndex = index() - 1;
//             while (true) {
//                 let char = chars.shift();
//                 if (!char) {
//                     throw new Error('Unexpected end of input.');
//                 }
//                 if (char === ';') {
//                     return { startIndex, endIndex: index(), text: directive };
//                 }
//                 directive += char;
//             }
//         }
//         function index() {
//             return src.length - chars.length;
//         }
//     }
//     /**
//      * @param src The src text of the SQL file
//      * @param srcPath The src path of the SQL file
//      * @param directives The directives parsed from `src`
//      */
//     function parseDirectives(directives: Directive[]) {
//         const imports: Record<string, UseDirective> = {};
//         const included: IncludeDirective[] = [];
//         const comments: CommentDirective[] = [];
//         directives.forEach((directive) => {
//             const directiveText = src.substring(
//                 directive.startIndex,
//                 directive.endIndex
//             );
//             if (directiveText.startsWith('-')) {
//                 const comment = parseCommentDirective(directive, directiveText);
//                 comments.push(comment);
//                 return;
//             }
//             if (directiveText.startsWith('@use')) {
//                 const use = parseUseDirective(directive, directiveText);
//                 imports[use.alias] = use;
//                 return;
//             }
//             if (directiveText.startsWith('@include')) {
//                 const _included = directiveText
//                     .substring('@include'.length, directiveText.length - 1)
//                     .trim();
//                 const interpolation = imports[_included];
//                 if (!interpolation) {
//                     throw new Error(`Cannot resolve import ${_included}.`);
//                 }
//                 included.push({
//                     include: _included,
//                     startIndex: directive.startIndex,
//                     endIndex: directive.endIndex
//                 });
//             }
//         });
//         return { use: imports, included, comments };
//     }
//     /**
//      * @param directive A directive identified as a `use` directive
//      * @param directiveText The directive text
//      * @param srcPath The source path of the file that includes the directive
//      */
//     function parseUseDirective(directive: Directive, directiveText: string) {
//         const split = directiveText.split(/\s/g);
//         // Remove the required semi-colon at the end of the alias name
//         let alias = split[3];
//         alias = alias.substring(0, alias.length - 1);
//         // Resolve the path relative to the src file
//         let path = split[1];
//         path = path.substring(1, path.length - 1);
//         if (!path.endsWith('.sasql')) path = path + '.sasql';
//         const importPath = join(dirname(srcPath), path);
//         const importSrc = readFileSync(importPath, 'utf-8');
//         const importedText = builder(importSrc, importPath, undefined);
//         return {
//             alias,
//             text: importedText,
//             srcPath,
//             startIndex: directive.startIndex,
//             endIndex: directive.endIndex
//         };
//     }
//     function parseCommentDirective(
//         directive: Directive,
//         directiveText: string
//     ): CommentDirective {
//         return {
//             startIndex: directive.startIndex,
//             endIndex: directive.endIndex,
//             comment: directiveText
//         };
//     }
// }
// function isCommentDirective(val: any): val is CommentDirective {
//     return val !== undefined && val !== null && 'comment' in val;
// }
//# sourceMappingURL=builder.js.map