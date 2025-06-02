import { DiagnosticCategory, DiagnosticMessage } from './diagnostic-message.js';
import { Token, TokenType } from './types.js';

export interface LexerRule {
    pattern: RegExp;
    type: TokenType;
    transform?: (match: string) => string;
    skip?: boolean;
}

export interface LexerOptions {
    ignoreWhitespace?: boolean;
    includeComments?: boolean;
}

export interface LexResult {
    tokens: Token[];
    diagnosticMessages: DiagnosticMessage[];
}

export class Lexer {
    private input: string;
    private position: number = 0;
    private line: number = 1;
    private column: number = 1;
    private srcPath: string;
    private options: LexerOptions;

    // Define lexer rules in order of priority
    private rules: LexerRule[] = [
        // Whitespace (must come before other patterns)
        {
            pattern: /^\s+/,
            type: TokenType.WHITESPACE,
            skip: true // Will be controlled by options
        },
        // Multi-line comments
        {
            pattern: /^\/\*\*[\s\S]*?\*\//,
            type: TokenType.COMMENT_BLOCK
        },
        // Single-line comments
        {
            pattern: /^--.*$/m,
            type: TokenType.COMMENT_LN
        },

        // String literals (quoted strings)
        {
            pattern: /^'(?:[^'\\]|\\.)*'/,
            type: TokenType.STRING
        },
        {
            pattern: /^"(?:[^"\\]|\\.)*"/,
            type: TokenType.STRING
        },

        // Directives (must come before TEXT to catch @-prefixed words)
        {
            pattern: /^@[a-zA-Z_][a-zA-Z0-9_]*/,
            type: TokenType.DIRECTIVE
        },

        // Variables (parameters like $1, $2)
        {
            pattern: /^\$[a-zA-Z0-9_]+/,
            type: TokenType.VARIABLE
        },

        // Numbers (integers and decimals)
        {
            pattern: /^\d+(?:\.\d+)?/,
            type: TokenType.NUMBER
        },

        // Identifiers and keywords
        {
            pattern: /^[a-zA-Z_][a-zA-Z0-9_]*/,
            type: TokenType.TEXT
        },

        // Multi-character operators and punctuation
        {
            pattern: /^(\|\||&&|<=|>=|!=|<>|::)/,
            type: TokenType.PUNCTUATION
        },

        // Single-character punctuation
        {
            pattern: /^[{}()\[\]\\\/;*=.<>!+\-,|&]/,
            type: TokenType.PUNCTUATION
        }
    ];

    constructor(input: string, srcPath: string, options: LexerOptions = {}) {
        this.input = input;
        this.srcPath = srcPath;
        this.options = {
            ignoreWhitespace: options.ignoreWhitespace ?? true,
            includeComments: options.includeComments ?? false,
            ...options
        };
    }

    public tokenize(): LexResult {
        const tokens: Token[] = [];
        const diagnosticMessages: DiagnosticMessage[] = [];

        while (this.position < this.input.length) {
            const startPosition = this.position;
            const startLine = this.line;
            const startColumn = this.column;

            let matched = false;

            // Try each rule in order
            for (const rule of this.rules) {
                const remaining = this.input.slice(this.position);
                const match = remaining.match(rule.pattern);

                if (match && match.index === 0) {
                    const matchText = match[0];
                    const transformedText = rule.transform
                        ? rule.transform(matchText)
                        : matchText;

                    // Skip whitespace if ignoreWhitespace is true
                    if (
                        rule.type === TokenType.WHITESPACE &&
                        this.options.ignoreWhitespace
                    ) {
                        this.advance(matchText);
                        matched = true;
                        break;
                    }

                    // Skip comments if includeComments is false
                    if (
                        (rule.type === TokenType.COMMENT_BLOCK ||
                            rule.type === TokenType.COMMENT_LN) &&
                        !this.options.includeComments
                    ) {
                        this.advance(matchText);
                        matched = true;
                        break;
                    }

                    // Skip tokens marked with skip flag
                    if (rule.skip) {
                        this.advance(matchText);
                        matched = true;
                        break;
                    }

                    const token: Token = {
                        type: rule.type,
                        text: transformedText,
                        startIndex: startPosition,
                        endIndex: this.position + matchText.length,
                        start: {
                            line: startLine,
                            character: startColumn
                        },
                        end: {
                            line: this.line,
                            character: this.column + matchText.length
                        }
                    };

                    tokens.push(token);
                    this.advance(matchText);
                    matched = true;
                    break;
                }
            }

            // Handle unrecognized characters
            if (!matched) {
                const char = this.input[this.position];
                const unknownToken: Token = {
                    type: TokenType.UNKNOWN,
                    text: char,
                    startIndex: startPosition,
                    endIndex: this.position + 1,
                    start: {
                        line: startLine,
                        character: startColumn
                    },
                    end: {
                        line: this.line,
                        character: this.column + 1
                    }
                };

                diagnosticMessages.push(
                    new DiagnosticMessage(
                        `Unexpected character: '${char}'`,
                        DiagnosticCategory.WARNING,
                        this.input,
                        this.srcPath,
                        unknownToken
                    )
                );

                tokens.push(unknownToken);
                this.advance(char);
            }
        }

        return { tokens, diagnosticMessages };
    }

    private advance(text: string): void {
        for (const char of text) {
            if (char === '\n') {
                this.line++;
                this.column = 1;
            } else {
                this.column++;
            }
            this.position++;
        }
    }
}

export function tokenize(
    source: string,
    srcPath: string,
    options: LexerOptions = {}
): LexResult {
    const lexer = new Lexer(source, srcPath, options);
    return lexer.tokenize();
}

export function createCustomLexer(
    input: string,
    srcPath: string,
    customRules: LexerRule[] = [],
    options: LexerOptions = {}
): Lexer {
    const lexer = new Lexer(input, srcPath, options);

    // Insert custom rules at the beginning (highest priority)
    (lexer as any).rules = [...customRules, ...(lexer as any).rules];

    return lexer;
}

export function createSQLLexer(
    input: string,
    srcPath: string,
    options: LexerOptions = {}
): Lexer {
    const sqlKeywords: LexerRule[] = [
        {
            pattern:
                /^(?:SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|TABLE|INDEX|VIEW|DISTINCT|ORDER\s+BY|GROUP\s+BY|HAVING|UNION|JOIN|INNER\s+JOIN|LEFT\s+JOIN|RIGHT\s+JOIN|FULL\s+JOIN|ON|AS|AND|OR|NOT|IN|EXISTS|BETWEEN|LIKE|IS\s+NULL|IS\s+NOT\s+NULL)\b/i,
            type: TokenType.TEXT, // @todo separate KEYWORD type
            transform: (match) => match.toUpperCase()
        }
    ];

    return createCustomLexer(input, srcPath, sqlKeywords, options);
}
