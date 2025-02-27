import { POSTGRES_KEYWORDS, POSTGRES_OPERATORS, Token } from './types.js';

/**
 * Simple lexer to tokenize a PostgreSQL query
 */
export function tokenize(sql: string): Token[] {
    const tokens: Token[] = [];
    let position = 0;
    let line = 1;
    let column = 1;

    while (position < sql.length) {
        let char = sql[position];

        // Handle whitespace
        if (/\s/.test(char)) {
            let start = position;
            while (position < sql.length && /\s/.test(sql[position])) {
                if (sql[position] === '\n') {
                    line++;
                    column = 1;
                } else {
                    column++;
                }
                position++;
            }
            tokens.push({
                type: 'whitespace',
                value: sql.substring(start, position),
                line,
                column: column - (position - start)
            });
            continue;
        }

        // Handle comments
        if (
            char === '-' &&
            position + 1 < sql.length &&
            sql[position + 1] === '-'
        ) {
            let start = position;
            position += 2;
            column += 2;
            while (position < sql.length && sql[position] !== '\n') {
                position++;
                column++;
            }
            tokens.push({
                type: 'comment',
                value: sql.substring(start, position),
                line,
                column: column - (position - start)
            });
            continue;
        }

        // Handle parameter markers ($1, $2, etc.)
        if (char === '$' && /\d/.test(sql[position + 1] || '')) {
            let start = position;
            position++;
            column++;
            while (position < sql.length && /\d/.test(sql[position])) {
                position++;
                column++;
            }
            tokens.push({
                type: 'parameter',
                value: sql.substring(start, position),
                line,
                column: column - (position - start)
            });
            continue;
        }

        // Handle identifiers and keywords
        if (/[a-zA-Z_]/.test(char) || char === '"') {
            let start = position;
            let isQuoted = char === '"';

            if (isQuoted) {
                position++;
                column++;
                while (position < sql.length && sql[position] !== '"') {
                    position++;
                    column++;
                }
                if (position < sql.length) {
                    // Skip closing quote
                    position++;
                    column++;
                }
            } else {
                while (
                    position < sql.length &&
                    /[a-zA-Z0-9_]/.test(sql[position])
                ) {
                    position++;
                    column++;
                }
            }

            const value = sql.substring(start, position);
            const upperValue = isQuoted ? value : value.toUpperCase();

            tokens.push({
                type: isQuoted
                    ? 'identifier'
                    : POSTGRES_KEYWORDS.has(upperValue)
                      ? 'keyword'
                      : 'identifier',
                value,
                line,
                column: column - (position - start)
            });
            continue;
        }

        // Handle string literals
        if (
            char === "'" ||
            (char === 'E' &&
                position + 1 < sql.length &&
                sql[position + 1] === "'")
        ) {
            let start = position;
            if (char === 'E') {
                position += 2;
                column += 2;
            } else {
                position++;
                column++;
            }

            let escaped = false;
            while (position < sql.length) {
                if (sql[position] === "'" && !escaped) {
                    if (
                        position + 1 < sql.length &&
                        sql[position + 1] === "'"
                    ) {
                        // Handle double quotes in literals
                        position += 2;
                        column += 2;
                    } else {
                        position++;
                        column++;
                        break;
                    }
                } else {
                    escaped = sql[position] === '\\' && !escaped;
                    position++;
                    column++;
                }
            }

            tokens.push({
                type: 'literal',
                value: sql.substring(start, position),
                line,
                column: column - (position - start)
            });
            continue;
        }

        // Handle numeric literals
        if (
            /[0-9]/.test(char) ||
            (char === '.' && /[0-9]/.test(sql[position + 1] || ''))
        ) {
            let start = position;
            let hasDecimal = char === '.';

            while (position < sql.length) {
                if (sql[position] === '.' && !hasDecimal) {
                    hasDecimal = true;
                    position++;
                    column++;
                } else if (/[0-9]/.test(sql[position])) {
                    position++;
                    column++;
                } else {
                    break;
                }
            }

            // Handle scientific notation
            if (
                (sql[position] === 'e' || sql[position] === 'E') &&
                position + 1 < sql.length
            ) {
                position++;
                column++;
                if (sql[position] === '+' || sql[position] === '-') {
                    position++;
                    column++;
                }
                while (position < sql.length && /[0-9]/.test(sql[position])) {
                    position++;
                    column++;
                }
            }

            tokens.push({
                type: 'literal',
                value: sql.substring(start, position),
                line,
                column: column - (position - start)
            });
            continue;
        }

        // Handle operators and punctuation
        if (/[=<>!+\-*/%^~@&|]/.test(char)) {
            let start = position;
            let possibleOp = char;
            position++;
            column++;

            // Try to match multi-character operators
            if (position < sql.length) {
                const twoCharOp = possibleOp + sql[position];
                if (POSTGRES_OPERATORS.has(twoCharOp)) {
                    possibleOp = twoCharOp;
                    position++;
                    column++;

                    // Try to match three-character operators
                    if (position < sql.length) {
                        const threeCharOp = possibleOp + sql[position];
                        if (POSTGRES_OPERATORS.has(threeCharOp)) {
                            possibleOp = threeCharOp;
                            position++;
                            column++;
                        }
                    }
                }
            }

            tokens.push({
                type: 'operator',
                value: sql.substring(start, position),
                line,
                column: column - (position - start)
            });
            continue;
        }

        // Handle punctuation
        if (/[,;.()\[\]{}]/.test(char)) {
            tokens.push({
                type: 'punctuation',
                value: char,
                line,
                column
            });
            position++;
            column++;
            continue;
        }

        // Handle unknown characters
        position++;
        column++;
    }

    return tokens;
}
