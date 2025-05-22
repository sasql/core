import { DiagnosticMessage } from '../diagnostic-message.js';
import { ChunkType, CommentBlock, DocTaggedLn, Token } from '../types.js';

export function parseCommentBlock(block: Token): {
    commentBlock: CommentBlock;
    diagnosticMessages: DiagnosticMessage[];
} {
    const tagLns: DocTaggedLn[] = [];
    const diagnosticMessages: DiagnosticMessage[] = [];

    const chars = [...block.text];

    let commentText = '';
    while (true) {
        let char = chars.shift();

        if (!char || isEndOfBlock(char)) {
            return {
                commentBlock: {
                    type: ChunkType.COMMENT_BLOCK,
                    startIndex: block.startIndex,
                    endIndex: block.endIndex,
                    text: commentText.trim(),
                    tags: tagLns
                },
                diagnosticMessages
            };
        }

        if (char === '@') {
            const ln = consumeDocTag();

            if (ln instanceof DiagnosticMessage) {
                ln.endIndex = index();
                diagnosticMessages.push(ln);
                continue;
            }

            tagLns.push(ln);

            continue;
        }

        if (char !== '*' && char !== '/') {
            commentText += char;
        }
    }

    function consumeDocTag() {
        let taggedLn = '@';

        while (true) {
            let char = chars.shift();

            if (!char || char === '@' || isEndOfBlock(char)) {
                if (char) chars.unshift(char);
                return parseDocTagLn(taggedLn, index() - 1);
            }

            taggedLn += char;
        }
    }

    function isEndOfBlock(char: string) {
        return char === '*' && chars[0] === '/';
    }

    function index() {
        return block.text.length - chars.length;
    }
}

export function parseDocTagLn(
    ln: string,
    startIndex: number
): DocTaggedLn | DiagnosticMessage {
    ln = ln.trim();

    if (ln.endsWith('*')) ln = ln.substring(0, ln.length - 2);

    const tagName = ln.substring(0, ln.indexOf(' '));

    if (tagName === '@param') {
        return parseParamDocTag();
    } else {
        return new DiagnosticMessage(
            'Unkown doc tag encountered ' + tagName,
            startIndex,
            -1
        );
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
