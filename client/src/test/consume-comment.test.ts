import { parseCommentBlock } from '../sys';

const exampleComment = /*js*/ `
/**
 * This is a description of the code that this comment describes.
 * @param {number} $1 - An example parameter
 * @param {text[]} $2 - Another example parameter
 * @param {text[] | null} $3 - A third example parameter
 */
`.trim();

// function consumeComment(text: string) {
//     const comments: any[] = [];

//     let chars = [...text];
//     while (true) {
//         let char = chars.shift();
//         if (!char) return comments;

//         if (char === '/' && chars[0] === '*' && chars[1] === '*') {
//             const block = consumeCommentBlock();
//             comments.push(block);
//         }
//     }

//     function consumeCommentBlock() {
//         let commentText = '';

//         let tagLns: any[] = [];

//         while (true) {
//             let char = chars.shift();
//             if (!char || isEndOfBlock(char)) {
//                 return { commentText: commentText.trim(), tagLns };
//             }

//             if (char === '@') {
//                 tagLns.push(consumeDocTag());
//                 continue;
//             }

//             if (char !== '*') {
//                 commentText += char;
//             }
//         }

//         function consumeDocTag() {
//             let taggedLn = '@';

//             while (true) {
//                 let char = chars.shift();

//                 if (!char || char === '@' || isEndOfBlock(char)) {
//                     if (char) chars.unshift(char);
//                     return parseDocTagLn(taggedLn);
//                 }

//                 taggedLn += char;
//             }
//         }

//         function isEndOfBlock(char: string) {
//             return char === '*' && chars[0] === '/';
//         }
//     }
// }

// function parseDocTagLn(ln: string) {
//     ln = ln.trim();

//     if (ln.endsWith('*')) ln = ln.substring(0, ln.length - 2);

//     const tagName = ln.substring(0, ln.indexOf(' '));

//     if (tagName === '@param') {
//         return parseParamDocTag();
//     }

//     function parseParamDocTag() {
//         const type = ln
//             .substring(ln.indexOf('{') + 1, ln.indexOf('}'))
//             .split(/\|/g)
//             .map((type) => type.trim());

//         let rest = ln.substring(ln.indexOf('}') + 1).trim();

//         const paramName = rest.substring(0, rest.indexOf(' '));

//         rest = rest.substring(rest.indexOf(' ')).trim();

//         if (rest.startsWith('-')) {
//             rest = rest.substring(1).trim();
//         }

//         return {
//             tagName,
//             type,
//             paramName,
//             description: rest
//         };
//     }
// }

console.log(
    JSON.stringify(
        parseCommentBlock({ text: exampleComment, startIndex: 0, endIndex: 0 }),
        null,
        4
    )
);
