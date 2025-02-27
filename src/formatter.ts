import { tokenize } from './tokenize.js';

/**
 * Format a PostgreSQL query with proper indentation and spacing
 */
export function formatPostgresQuery(sql: string): string {
    const tokens = tokenize(sql);
    let formatted = '';
    let indentLevel = 0;
    let newline = true;

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const nextToken = i < tokens.length - 1 ? tokens[i + 1] : null;

        // Skip original whitespace
        if (token.type === 'whitespace') {
            continue;
        }

        // Handle indentation for major clauses
        if (
            token.type === 'keyword' &&
            [
                'SELECT',
                'FROM',
                'WHERE',
                'ORDER BY',
                'GROUP BY',
                'HAVING',
                'LIMIT',
                'OFFSET'
            ].includes(token.value.toUpperCase())
        ) {
            if (token.value.toUpperCase() !== 'SELECT' || i > 0) {
                formatted += '\n';
            }
            formatted += ' '.repeat(indentLevel * 4);
            newline = false;
        }

        // Add appropriate spacing
        if (
            !newline &&
            token.type !== 'punctuation' &&
            token.value !== ',' &&
            formatted.length > 0 &&
            formatted[formatted.length - 1] !== ' ' &&
            formatted[formatted.length - 1] !== '(' &&
            formatted[formatted.length - 1] !== '\n'
        ) {
            formatted += ' ';
        }

        // Add the token
        formatted += token.value;

        // Handle commas
        if (token.value === ',') {
            formatted += '\n' + ' '.repeat(indentLevel * 4);
            newline = true;
        } else {
            newline = false;
        }

        // Handle parentheses for indentation
        if (token.type === 'punctuation') {
            if (token.value === '(') {
                indentLevel++;
                if (nextToken && nextToken.type !== 'whitespace') {
                    formatted += '\n' + ' '.repeat(indentLevel * 4);
                    newline = true;
                }
            } else if (token.value === ')') {
                indentLevel = Math.max(0, indentLevel - 1);
                if (nextToken && nextToken.value !== ',') {
                    formatted += '\n' + ' '.repeat(indentLevel * 4);
                    newline = true;
                }
            }
        }
    }

    return formatted;
}
