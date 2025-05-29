export const regexps = {
    regexps: {
        patterns: [
            {
                begin: '/(?=\\S.*/)',
                beginCaptures: {
                    0: {
                        name: 'punctuation.definition.string.begin.sasql'
                    }
                },
                end: '/',
                endCaptures: {
                    0: {
                        name: 'punctuation.definition.string.end.sasql'
                    }
                },
                name: 'string.regexp.sasql',
                patterns: [
                    {
                        include: '#string_interpolation'
                    },
                    {
                        match: '\\\\/',
                        name: 'constant.character.escape.slash.sasql'
                    }
                ]
            },
            {
                begin: '%r\\{',
                beginCaptures: {
                    0: {
                        name: 'punctuation.definition.string.begin.sasql'
                    }
                },
                comment:
                    'We should probably handle nested bracket pairs!?! -- Allan',
                end: '\\}',
                endCaptures: {
                    0: {
                        name: 'punctuation.definition.string.end.sasql'
                    }
                },
                name: 'string.regexp.modr.sasql',
                patterns: [
                    {
                        include: '#string_interpolation'
                    }
                ]
            }
        ]
    }
};
