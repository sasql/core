// @ts-check

/** @typedef {import('./types').Group} Group */
/** @typedef {import('./types').CaptureGroup} CaptureGroup */

/** @type {Group} */
const space = { regex: '\\s+' };

/** @param {string} type */
const _at = (type) => ['((?<!@)', type, ')'].join('');

const word = '([a-zA-Z0-9_\\-]+)';
const path = `(['\"].*?['\"])`;
const dot = `(\\.)`;
const terminator = '(;)';

const use = '@use';
const include = '@include';
const stmt = '@statement';

const meta = {
    directive: {
        sasql: 'meta.directive.at-rule.sasql',
        use: 'meta.directive.use.sasql',
        include: 'meta.directive.include.sasql',
        statement: 'meta.directive.statement.sasql'
    }
};

const keyword = {
    control: {
        directive: {
            use: 'keyword.control.directive.use.sasql',
            include: 'keyword.control.directive.include.sasql',
            statement: 'keyword.control.directive.use.sasql',
            as: 'keyword.control.directive.as.sasql'
        }
    }
};

const entity = {
    name: {
        namespace: {
            import: 'entity.name.namespace.import.sasql'
        },
        function: {
            statement: 'entity.name.function.statement.sasql'
        }
    }
};

const punctuation = {
    separator: 'punctuation.separator.sasql',
    terminator: 'punctuation.terminator.sasql'
};

const $ = {
    use: {
        name: meta.directive.use,
        at: keyword.control.directive.use,
        path: 'string.quoted.single',
        alias: keyword.control.directive.as,
        import: entity.name.namespace.import,
        terminator: punctuation.terminator
    },
    include: {
        name: meta.directive.include,
        at: keyword.control.directive.include,
        import: entity.name.namespace.import,
        dot: 'punctuation.separator.sasql',
        statement: entity.name.function.statement,
        terminator: punctuation.terminator
    },
    statement: {
        name: meta.directive.statement,
        at: keyword.control.directive.statement,
        declaration: entity.name.function.statement
    }
};

/** @type {Record<string, CaptureGroup>} */
const directiveSyntax = {
    use: {
        name: $.use.name,
        captures: [
            { regex: _at(use), name: $.use.at },
            space,
            { regex: path, name: $.use.path },
            space,
            { regex: `(as)`, name: $.use.alias },
            space,
            { regex: word, name: $.use.import },
            { regex: terminator, name: $.use.terminator }
        ]
    },
    importedInclude: {
        name: $.include.name,
        captures: [
            { regex: _at(include), name: $.include.at },
            space,
            { regex: word, name: $.include.import },
            { regex: dot, name: $.include.dot },
            { regex: word, name: $.include.statement },
            { regex: terminator, name: $.include.terminator }
        ]
    },
    localInclude: {
        name: $.include.name,
        captures: [
            { regex: _at(include), name: $.include.at },
            space,
            { regex: word, name: $.include.statement },
            { regex: terminator, name: $.include.terminator }
        ]
    },
    statement: {
        name: $.statement.name,
        captures: [
            { regex: _at(stmt), name: $.statement.at },
            space,
            { regex: word, name: $.statement.declaration }
        ]
    },
    directive: {
        name: meta.directive.sasql,
        captures: [{ regex: '((?<!@)@(use|include|statement))' }]
    }
};

export function getSasqlSyntax() {
    return Object.values(directiveSyntax).map((val) => {
        return formatGroup(val);
    });

    /**
     * @param {CaptureGroup} group
     */
    function formatGroup(group) {
        let match = '';
        const captures = {};
        let i = 1;
        group.captures.forEach((group) => {
            if (group.name) {
                captures[i++] = {
                    name: group.name
                };
            }

            match += group.regex;
        });

        return {
            match,
            name: group.name,
            captures
        };
    }
}

// TODO - write a function that will output this in the expected format
