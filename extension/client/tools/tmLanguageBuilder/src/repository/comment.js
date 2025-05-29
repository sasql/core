export const comment = {
    comments: {
        patterns: [
            {
                begin: '(^[ \\t]+)?(?=--)',
                beginCaptures: {
                    1: {
                        name: 'punctuation.whitespace.comment.leading.sasql'
                    }
                },
                end: '(?!\\G)',
                patterns: [
                    {
                        begin: '--',
                        beginCaptures: {
                            0: {
                                name: 'punctuation.definition.comment.sasql'
                            }
                        },
                        end: '\\n',
                        name: 'comment.line.double-dash.sasql'
                    }
                ]
            },
            {
                name: 'comment.block.documentation.sasql',
                begin: '/\\*\\*(?!/)',
                beginCaptures: {
                    0: {
                        name: 'punctuation.definition.comment.sasql'
                    }
                },
                end: '\\*/',
                endCaptures: {
                    0: {
                        name: 'punctuation.definition.comment.sasql'
                    }
                },
                patterns: [
                    {
                        include: '#docblock'
                    }
                ]
            },
            {
                name: 'comment.block.sasql',
                begin: '(/\\*)(?:\\s*((@)internal)(?=\\s|(\\*/)))?',
                beginCaptures: {
                    1: {
                        name: 'punctuation.definition.comment.sasql'
                    },
                    2: {
                        name: 'storage.type.internaldeclaration.sasql'
                    },
                    3: {
                        name: 'punctuation.decorator.internaldeclaration.sasql'
                    }
                },
                end: '\\*/',
                endCaptures: {
                    0: {
                        name: 'punctuation.definition.comment.sasql'
                    }
                }
            },
            {
                begin: '(^[ \\t]+)?((//)(?:\\s*((@)internal)(?=\\s|$))?)',
                beginCaptures: {
                    1: {
                        name: 'punctuation.whitespace.comment.leading.sasql'
                    },
                    2: {
                        name: 'comment.line.double-slash.sasql'
                    },
                    3: {
                        name: 'punctuation.definition.comment.sasql'
                    },
                    4: {
                        name: 'storage.type.internaldeclaration.sasql'
                    },
                    5: {
                        name: 'punctuation.decorator.internaldeclaration.sasql'
                    }
                },
                end: '(?=$)',
                contentName: 'comment.line.double-slash.sasql'
            }
        ]
    },
    'single-line-comment-consuming-line-ending': {
        begin: '(^[ \\t]+)?((//)(?:\\s*((@)internal)(?=\\s|$))?)',
        beginCaptures: {
            1: {
                name: 'punctuation.whitespace.comment.leading.sasql'
            },
            2: {
                name: 'comment.line.double-slash.sasql'
            },
            3: {
                name: 'punctuation.definition.comment.sasql'
            },
            4: {
                name: 'storage.type.internaldeclaration.sasql'
            },
            5: {
                name: 'punctuation.decorator.internaldeclaration.sasql'
            }
        },
        end: '(?=^)',
        contentName: 'comment.line.double-slash.sasql'
    },
    directives: {
        name: 'comment.line.triple-slash.directive.sasql',
        begin: '^(///)\\s*(?=<(reference|amd-dependency|amd-module)(\\s+(path|types|no-default-lib|lib|name|resolution-mode)\\s*=\\s*((\\\'([^\\\'\\\\]|\\\\.)*\\\')|(\\"([^\\"\\\\]|\\\\.)*\\")|(\\`([^\\`\\\\]|\\\\.)*\\`)))+\\s*/>\\s*$)',
        beginCaptures: {
            1: {
                name: 'punctuation.definition.comment.sasql'
            }
        },
        end: '(?=$)',
        patterns: [
            {
                name: 'meta.tag.sasql',
                begin: '(<)(reference|amd-dependency|amd-module)',
                beginCaptures: {
                    1: {
                        name: 'punctuation.definition.tag.directive.sasql'
                    },
                    2: {
                        name: 'entity.name.tag.directive.sasql'
                    }
                },
                end: '/>',
                endCaptures: {
                    0: {
                        name: 'punctuation.definition.tag.directive.sasql'
                    }
                },
                patterns: [
                    {
                        name: 'entity.other.attribute-name.directive.sasql',
                        match: 'path|types|no-default-lib|lib|name|resolution-mode'
                    },
                    {
                        name: 'keyword.operator.assignment.sasql',
                        match: '='
                    },
                    {
                        include: '#string'
                    }
                ]
            }
        ]
    },
    docblock: {
        patterns: [
            {
                match: '(?x)\n((@)(?:access|api))\n\\s+\n(private|protected|public)\n\\b',
                captures: {
                    1: {
                        name: 'storage.type.class.sasqldoc'
                    },
                    2: {
                        name: 'punctuation.definition.block.tag.sasqldoc'
                    },
                    3: {
                        name: 'constant.language.access-type.sasqldoc'
                    }
                }
            },
            {
                match: '(?x)\n((@)author)\n\\s+\n(\n  [^@\\s<>*/]\n  (?:[^@<>*/]|\\*[^/])*\n)\n(?:\n  \\s*\n  (<)\n  ([^>\\s]+)\n  (>)\n)?',
                captures: {
                    1: {
                        name: 'storage.type.class.sasqldoc'
                    },
                    2: {
                        name: 'punctuation.definition.block.tag.sasqldoc'
                    },
                    3: {
                        name: 'entity.name.type.instance.sasqldoc'
                    },
                    4: {
                        name: 'punctuation.definition.bracket.angle.begin.sasqldoc'
                    },
                    5: {
                        name: 'constant.other.email.link.underline.sasqldoc'
                    },
                    6: {
                        name: 'punctuation.definition.bracket.angle.end.sasqldoc'
                    }
                }
            },
            {
                match: '(?x)\n((@)borrows) \\s+\n((?:[^@\\s*/]|\\*[^/])+)    # <that namepath>\n\\s+ (as) \\s+              # as\n((?:[^@\\s*/]|\\*[^/])+)    # <this namepath>',
                captures: {
                    1: {
                        name: 'storage.type.class.sasqldoc'
                    },
                    2: {
                        name: 'punctuation.definition.block.tag.sasqldoc'
                    },
                    3: {
                        name: 'entity.name.type.instance.sasqldoc'
                    },
                    4: {
                        name: 'keyword.operator.control.sasqldoc'
                    },
                    5: {
                        name: 'entity.name.type.instance.sasqldoc'
                    }
                }
            },
            {
                name: 'meta.example.sasqldoc',
                begin: '((@)example)\\s+',
                end: '(?=@|\\*/)',
                beginCaptures: {
                    1: {
                        name: 'storage.type.class.sasqldoc'
                    },
                    2: {
                        name: 'punctuation.definition.block.tag.sasqldoc'
                    }
                },
                patterns: [
                    {
                        match: '^\\s\\*\\s+'
                    },
                    {
                        contentName: 'constant.other.description.sasqldoc',
                        begin: '\\G(<)caption(>)',
                        beginCaptures: {
                            0: {
                                name: 'entity.name.tag.inline.sasqldoc'
                            },
                            1: {
                                name: 'punctuation.definition.bracket.angle.begin.sasqldoc'
                            },
                            2: {
                                name: 'punctuation.definition.bracket.angle.end.sasqldoc'
                            }
                        },
                        end: '(</)caption(>)|(?=\\*/)',
                        endCaptures: {
                            0: {
                                name: 'entity.name.tag.inline.sasqldoc'
                            },
                            1: {
                                name: 'punctuation.definition.bracket.angle.begin.sasqldoc'
                            },
                            2: {
                                name: 'punctuation.definition.bracket.angle.end.sasqldoc'
                            }
                        }
                    },
                    {
                        match: '[^\\s@*](?:[^*]|\\*[^/])*',
                        captures: {
                            0: {
                                name: 'source.embedded.sasql'
                            }
                        }
                    }
                ]
            },
            {
                match: '(?x) ((@)kind) \\s+ (class|constant|event|external|file|function|member|mixin|module|namespace|typedef) \\b',
                captures: {
                    1: {
                        name: 'storage.type.class.sasqldoc'
                    },
                    2: {
                        name: 'punctuation.definition.block.tag.sasqldoc'
                    },
                    3: {
                        name: 'constant.language.symbol-type.sasqldoc'
                    }
                }
            },
            {
                match: '(?x)\n((@)see)\n\\s+\n(?:\n  # URL\n  (\n    (?=https?://)\n    (?:[^\\s*]|\\*[^/])+\n  )\n  |\n  # JSDoc namepath\n  (\n    (?!\n      # Avoid matching bare URIs (also acceptable as links)\n      https?://\n      |\n      # Avoid matching {@inline tags}; we match those below\n      (?:\\[[^\\[\\]]*\\])? # Possible description [preceding]{@tag}\n      {@(?:link|linkcode|linkplain|tutorial)\\b\n    )\n    # Matched namepath\n    (?:[^@\\s*/]|\\*[^/])+\n  )\n)',
                captures: {
                    1: {
                        name: 'storage.type.class.sasqldoc'
                    },
                    2: {
                        name: 'punctuation.definition.block.tag.sasqldoc'
                    },
                    3: {
                        name: 'variable.other.link.underline.sasqldoc'
                    },
                    4: {
                        name: 'entity.name.type.instance.sasqldoc'
                    }
                }
            },
            {
                match: '(?x)\n((@)template)\n\\s+\n# One or more valid identifiers\n(\n  [A-Za-z_$]         # First character: non-numeric word character\n  [\\w$.\\[\\]]*        # Rest of identifier\n  (?:                # Possible list of additional identifiers\n    \\s* , \\s*\n    [A-Za-z_$]\n    [\\w$.\\[\\]]*\n  )*\n)',
                captures: {
                    1: {
                        name: 'storage.type.class.sasqldoc'
                    },
                    2: {
                        name: 'punctuation.definition.block.tag.sasqldoc'
                    },
                    3: {
                        name: 'variable.other.sasqldoc'
                    }
                }
            },
            {
                begin: '(?x)((@)template)\\s+(?={)',
                beginCaptures: {
                    1: {
                        name: 'storage.type.class.sasqldoc'
                    },
                    2: {
                        name: 'punctuation.definition.block.tag.sasqldoc'
                    }
                },
                end: '(?=\\s|\\*/|[^{}\\[\\]A-Za-z_$])',
                patterns: [
                    {
                        include: '#jsdoctype'
                    },
                    {
                        name: 'variable.other.sasqldoc',
                        match: '([A-Za-z_$][\\w$.\\[\\]]*)'
                    }
                ]
            },
            {
                match: '(?x)\n(\n  (@)\n  (?:arg|argument|const|constant|member|namespace|param|var)\n)\n\\s+\n(\n  [A-Za-z_$]\n  [\\w$.\\[\\]]*\n)',
                captures: {
                    1: {
                        name: 'storage.type.class.sasqldoc'
                    },
                    2: {
                        name: 'punctuation.definition.block.tag.sasqldoc'
                    },
                    3: {
                        name: 'variable.other.sasqldoc'
                    }
                }
            },
            {
                begin: '((@)typedef)\\s+(?={)',
                beginCaptures: {
                    1: {
                        name: 'storage.type.class.sasqldoc'
                    },
                    2: {
                        name: 'punctuation.definition.block.tag.sasqldoc'
                    }
                },
                end: '(?=\\s|\\*/|[^{}\\[\\]A-Za-z_$])',
                patterns: [
                    {
                        include: '#jsdoctype'
                    },
                    {
                        name: 'entity.name.type.instance.sasqldoc',
                        match: '(?:[^@\\s*/]|\\*[^/])+'
                    }
                ]
            },
            {
                begin: '((@)(?:arg|argument|const|constant|member|namespace|param|prop|property|var))\\s+(?={)',
                beginCaptures: {
                    1: {
                        name: 'storage.type.class.sasqldoc'
                    },
                    2: {
                        name: 'punctuation.definition.block.tag.sasqldoc'
                    }
                },
                end: '(?=\\s|\\*/|[^{}\\[\\]A-Za-z_$])',
                patterns: [
                    {
                        include: '#jsdoctype'
                    },
                    {
                        name: 'variable.other.sasqldoc',
                        match: '([A-Za-z_$][\\w$.\\[\\]]*)'
                    },
                    {
                        name: 'variable.other.sasqldoc',
                        match: '(?x)\n(\\[)\\s*\n[\\w$]+\n(?:\n  (?:\\[\\])?                                        # Foo[ ].bar properties within an array\n  \\.                                                # Foo.Bar namespaced parameter\n  [\\w$]+\n)*\n(?:\n  \\s*\n  (=)                                                # [foo=bar] Default parameter value\n  \\s*\n  (\n    # The inner regexes are to stop the match early at */ and to not stop at escaped quotes\n    (?>\n      "(?:(?:\\*(?!/))|(?:\\\\(?!"))|[^*\\\\])*?" |                      # [foo="bar"] Double-quoted\n      \'(?:(?:\\*(?!/))|(?:\\\\(?!\'))|[^*\\\\])*?\' |                      # [foo=\'bar\'] Single-quoted\n      \\[ (?:(?:\\*(?!/))|[^*])*? \\] |                                # [foo=[1,2]] Array literal\n      (?:(?:\\*(?!/))|\\s(?!\\s*\\])|\\[.*?(?:\\]|(?=\\*/))|[^*\\s\\[\\]])*   # Everything else\n    )*\n  )\n)?\n\\s*(?:(\\])((?:[^*\\s]|\\*[^\\s/])+)?|(?=\\*/))',
                        captures: {
                            1: {
                                name: 'punctuation.definition.optional-value.begin.bracket.square.sasqldoc'
                            },
                            2: {
                                name: 'keyword.operator.assignment.sasqldoc'
                            },
                            3: {
                                name: 'source.embedded.sasql'
                            },
                            4: {
                                name: 'punctuation.definition.optional-value.end.bracket.square.sasqldoc'
                            },
                            5: {
                                name: 'invalid.illegal.syntax.sasqldoc'
                            }
                        }
                    }
                ]
            },
            {
                begin: '(?x)\n(\n  (@)\n  (?:define|enum|exception|export|extends|lends|implements|modifies\n  |namespace|private|protected|returns?|satisfies|suppress|this|throws|type\n  |yields?)\n)\n\\s+(?={)',
                beginCaptures: {
                    1: {
                        name: 'storage.type.class.sasqldoc'
                    },
                    2: {
                        name: 'punctuation.definition.block.tag.sasqldoc'
                    }
                },
                end: '(?=\\s|\\*/|[^{}\\[\\]A-Za-z_$])',
                patterns: [
                    {
                        include: '#jsdoctype'
                    }
                ]
            },
            {
                match: '(?x)\n(\n  (@)\n  (?:alias|augments|callback|constructs|emits|event|fires|exports?\n  |extends|external|function|func|host|lends|listens|interface|memberof!?\n  |method|module|mixes|mixin|name|requires|see|this|typedef|uses)\n)\n\\s+\n(\n  (?:\n    [^{}@\\s*] | \\*[^/]\n  )+\n)',
                captures: {
                    1: {
                        name: 'storage.type.class.sasqldoc'
                    },
                    2: {
                        name: 'punctuation.definition.block.tag.sasqldoc'
                    },
                    3: {
                        name: 'entity.name.type.instance.sasqldoc'
                    }
                }
            },
            {
                contentName: 'variable.other.sasqldoc',
                begin: "((@)(?:default(?:value)?|license|version))\\s+(([''\"]))",
                beginCaptures: {
                    1: {
                        name: 'storage.type.class.sasqldoc'
                    },
                    2: {
                        name: 'punctuation.definition.block.tag.sasqldoc'
                    },
                    3: {
                        name: 'variable.other.sasqldoc'
                    },
                    4: {
                        name: 'punctuation.definition.string.begin.sasqldoc'
                    }
                },
                end: '(\\3)|(?=$|\\*/)',
                endCaptures: {
                    0: {
                        name: 'variable.other.sasqldoc'
                    },
                    1: {
                        name: 'punctuation.definition.string.end.sasqldoc'
                    }
                }
            },
            {
                match: '((@)(?:default(?:value)?|license|tutorial|variation|version))\\s+([^\\s*]+)',
                captures: {
                    1: {
                        name: 'storage.type.class.sasqldoc'
                    },
                    2: {
                        name: 'punctuation.definition.block.tag.sasqldoc'
                    },
                    3: {
                        name: 'variable.other.sasqldoc'
                    }
                }
            },
            {
                name: 'storage.type.class.sasqldoc',
                match: '(?x) (@) (?:abstract|access|alias|api|arg|argument|async|attribute|augments|author|beta|borrows|bubbles |callback|chainable|class|classdesc|code|config|const|constant|constructor|constructs|copyright |default|defaultvalue|define|deprecated|desc|description|dict|emits|enum|event|example|exception |exports?|extends|extension(?:_?for)?|external|externs|file|fileoverview|final|fires|for|func |function|generator|global|hideconstructor|host|ignore|implements|implicitCast|inherit[Dd]oc |inner|instance|interface|internal|kind|lends|license|listens|main|member|memberof!?|method |mixes|mixins?|modifies|module|name|namespace|noalias|nocollapse|nocompile|nosideeffects |override|overview|package|param|polymer(?:Behavior)?|preserve|private|prop|property|protected |public|read[Oo]nly|record|require[ds]|returns?|see|since|static|struct|submodule|summary |suppress|template|this|throws|todo|tutorial|type|typedef|unrestricted|uses|var|variation |version|virtual|writeOnce|yields?) \\b',
                captures: {
                    1: {
                        name: 'punctuation.definition.block.tag.sasqldoc'
                    }
                }
            },
            {
                include: '#inline-tags'
            },
            {
                match: '((@)(?:[_$[:alpha:]][_$[:alnum:]]*))(?=\\s+)',
                captures: {
                    1: {
                        name: 'storage.type.class.sasqldoc'
                    },
                    2: {
                        name: 'punctuation.definition.block.tag.sasqldoc'
                    }
                }
            }
        ]
    },
    brackets: {
        patterns: [
            {
                begin: '{',
                end: '}|(?=\\*/)',
                patterns: [
                    {
                        include: '#brackets'
                    }
                ]
            },
            {
                begin: '\\[',
                end: '\\]|(?=\\*/)',
                patterns: [
                    {
                        include: '#brackets'
                    }
                ]
            }
        ]
    },
    'inline-tags': {
        patterns: [
            {
                name: 'constant.other.description.sasqldoc',
                match: '(\\[)[^\\]]+(\\])(?={@(?:link|linkcode|linkplain|tutorial))',
                captures: {
                    1: {
                        name: 'punctuation.definition.bracket.square.begin.sasqldoc'
                    },
                    2: {
                        name: 'punctuation.definition.bracket.square.end.sasqldoc'
                    }
                }
            },
            {
                name: 'entity.name.type.instance.sasqldoc',
                begin: '({)((@)(?:link(?:code|plain)?|tutorial))\\s*',
                beginCaptures: {
                    1: {
                        name: 'punctuation.definition.bracket.curly.begin.sasqldoc'
                    },
                    2: {
                        name: 'storage.type.class.sasqldoc'
                    },
                    3: {
                        name: 'punctuation.definition.inline.tag.sasqldoc'
                    }
                },
                end: '}|(?=\\*/)',
                endCaptures: {
                    0: {
                        name: 'punctuation.definition.bracket.curly.end.sasqldoc'
                    }
                },
                patterns: [
                    {
                        match: '\\G((?=https?://)(?:[^|}\\s*]|\\*[/])+)(\\|)?',
                        captures: {
                            1: {
                                name: 'variable.other.link.underline.sasqldoc'
                            },
                            2: {
                                name: 'punctuation.separator.pipe.sasqldoc'
                            }
                        }
                    },
                    {
                        match: '\\G((?:[^{}@\\s|*]|\\*[^/])+)(\\|)?',
                        captures: {
                            1: {
                                name: 'variable.other.description.sasqldoc'
                            },
                            2: {
                                name: 'punctuation.separator.pipe.sasqldoc'
                            }
                        }
                    }
                ]
            }
        ]
    },
    jsdoctype: {
        patterns: [
            {
                contentName: 'entity.name.type.instance.sasqldoc',
                begin: '\\G({)',
                beginCaptures: {
                    0: {
                        name: 'entity.name.type.instance.sasqldoc'
                    },
                    1: {
                        name: 'punctuation.definition.bracket.curly.begin.sasqldoc'
                    }
                },
                end: '((}))\\s*|(?=\\*/)',
                endCaptures: {
                    1: {
                        name: 'entity.name.type.instance.sasqldoc'
                    },
                    2: {
                        name: 'punctuation.definition.bracket.curly.end.sasqldoc'
                    }
                },
                patterns: [
                    {
                        include: '#brackets'
                    }
                ]
            }
        ]
    }
};
