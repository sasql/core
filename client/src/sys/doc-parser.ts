import { CommentBlock, CommentBlockRaw, DocTaggedLn } from './types';

export function parseCommentBlock(block: CommentBlockRaw): CommentBlock {
    let commentText = '';
    let tagLns: DocTaggedLn[] = [];

    const chars = [...block.text];

    while (true) {
        let char = chars.shift();
        if (!char || isEndOfBlock(char)) {
            return {
                startIndex: block.startIndex,
                endIndex: block.endIndex,
                text: commentText.trim(),
                tags: tagLns
            };
        }

        if (char === '@') {
            const ln = consumeDocTag();
            if (ln) tagLns.push(ln);
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
                return parseDocTagLn(taggedLn);
            }

            taggedLn += char;
        }
    }

    function isEndOfBlock(char: string) {
        return char === '*' && chars[0] === '/';
    }
}

export function parseDocTagLn(ln: string): DocTaggedLn | undefined {
    ln = ln.trim();

    if (ln.endsWith('*')) ln = ln.substring(0, ln.length - 2);

    const tagName = ln.substring(0, ln.indexOf(' '));

    if (tagName === '@param') {
        return parseParamDocTag();
    } else {
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
