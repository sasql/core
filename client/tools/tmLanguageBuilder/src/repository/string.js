export const string = {
    string_escape: {
        match: '\\\\.',
        name: 'constant.character.escape.sasql'
    },
    string_interpolation: {
        captures: {
            1: {
                name: 'punctuation.definition.string.begin.sasql'
            },
            3: {
                name: 'punctuation.definition.string.end.sasql'
            }
        },
        match: '(#\\{)([^\\}]*)(\\})',
        name: 'string.interpolated.sasql'
    },
    strings: {
        patterns: [
            {
                captures: {
                    2: {
                        name: 'punctuation.definition.string.begin.sasql'
                    },
                    3: {
                        name: 'punctuation.definition.string.end.sasql'
                    }
                },
                comment:
                    'this is faster than the next begin/end rule since sub-pattern will match till end-of-line and SQL files tend to have very long lines.',
                match: "(N)?(')[^']*(')",
                name: 'string.quoted.single.sasql'
            },
            {
                begin: "'",
                beginCaptures: {
                    0: {
                        name: 'punctuation.definition.string.begin.sasql'
                    }
                },
                end: "'",
                endCaptures: {
                    0: {
                        name: 'punctuation.definition.string.end.sasql'
                    }
                },
                name: 'string.quoted.single.sasql',
                patterns: [
                    {
                        include: '#string_escape'
                    }
                ]
            },
            {
                captures: {
                    1: {
                        name: 'punctuation.definition.string.begin.sasql'
                    },
                    2: {
                        name: 'punctuation.definition.string.end.sasql'
                    }
                },
                comment:
                    'this is faster than the next begin/end rule since sub-pattern will match till end-of-line and SQL files tend to have very long lines.',
                match: '(`)[^`\\\\]*(`)',
                name: 'string.quoted.other.backtick.sasql'
            },
            {
                begin: '`',
                beginCaptures: {
                    0: {
                        name: 'punctuation.definition.string.begin.sasql'
                    }
                },
                end: '`',
                endCaptures: {
                    0: {
                        name: 'punctuation.definition.string.end.sasql'
                    }
                },
                name: 'string.quoted.other.backtick.sasql',
                patterns: [
                    {
                        include: '#string_escape'
                    }
                ]
            },
            {
                captures: {
                    1: {
                        name: 'punctuation.definition.string.begin.sasql'
                    },
                    2: {
                        name: 'punctuation.definition.string.end.sasql'
                    }
                },
                comment:
                    'this is faster than the next begin/end rule since sub-pattern will match till end-of-line and SQL files tend to have very long lines.',
                match: '(")[^"#]*(")',
                name: 'string.quoted.double.sasql'
            },
            {
                begin: '"',
                beginCaptures: {
                    0: {
                        name: 'punctuation.definition.string.begin.sasql'
                    }
                },
                end: '"',
                endCaptures: {
                    0: {
                        name: 'punctuation.definition.string.end.sasql'
                    }
                },
                name: 'string.quoted.double.sasql',
                patterns: [
                    {
                        include: '#string_interpolation'
                    }
                ]
            },
            {
                begin: '%\\{',
                beginCaptures: {
                    0: {
                        name: 'punctuation.definition.string.begin.sasql'
                    }
                },
                end: '\\}',
                endCaptures: {
                    0: {
                        name: 'punctuation.definition.string.end.sasql'
                    }
                },
                name: 'string.other.quoted.brackets.sasql',
                patterns: [
                    {
                        include: '#string_interpolation'
                    }
                ]
            }
        ]
    }
};
