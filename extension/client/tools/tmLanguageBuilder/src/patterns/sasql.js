// @ts-check

/** @typedef {import('./types').Capture} Capture */
/** @typedef {import('./types').CaptureGroup} CaptureGroup */
/** @typedef {import('./types').DirectiveType} DirectiveType */

const word = '([a-zA-Z0-9_\\-]+)';
const space = { regex: '\\s+' };
const terminator = { name: 'punctuation.terminator.sasql', regex: '(;)' };
const path = { name: 'string.quoted.single.sasql', regex: `(['\"].*?['\"])` };
const as = { name: 'keyword.control.directive.as.sasql', regex: `(as)` };
const dot = { name: 'punctuation.separator.sasql', regex: `(\\.)` };

const import_alias = {
    name: 'entity.name.namespace.import.sasql',
    regex: word
};
const stmt_name = { name: 'entity.name.function.statement.sasql', regex: word };

/** @param { DirectiveType } name */
function name(name) {
    return `meta.directive.${name}.sasql`;
}

/** @param {DirectiveType} name */
function at(name) {
    return {
        name: `keyword.control.directive.${name}.sasql`,
        regex: ['((?<!@)@', name, ')'].join('')
    };
}

/** @type {CaptureGroup[]} */
const directiveSyntax = [
    {
        /** `@use './path/to/file' as import_alias;` */
        name: name('use'),
        captures: [
            at('use'),
            space,
            path,
            space,
            as,
            space,
            import_alias,
            terminator
        ]
    },
    {
        /** `@include import_alias.stmt_name;` */
        name: name('include'),
        captures: [
            at('include'),
            space,
            import_alias,
            dot,
            stmt_name,
            terminator
        ]
    },
    {
        /** `@include stmt_name;` */
        name: name('include'),
        captures: [at('include'), space, stmt_name, terminator]
    },
    {
        /** `@statement stmt_name` */
        name: name('statement'),
        captures: [at('statement'), space, stmt_name]
    },
    {
        /** ` @use | @include | @statement ` */
        name: 'meta.directive.sasql',
        captures: [{ regex: '((?<!@)@(use|include|statement))' }]
    },
    {
        name: 'variable.parameter.sasql',
        captures: [{ regex: '(\\$[0-9]*)' }]
    }
];

export function getSasqlSyntax() {
    return directiveSyntax.map((group) => {
        const captures = {};

        let match = '';
        let i = 1;
        group.captures.forEach((group) => {
            if (group.name) {
                captures[i++] = {
                    name: group.name
                };
            }

            match += group.regex;
        });

        if (Object.values(captures).length === 0) {
            return { match, name: group.name };
        }

        return { match, name: group.name, captures };
    });
}

console.log(getSasqlSyntax());
