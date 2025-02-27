import { tokenize } from './tokenize.js';
import { Token } from './types.js';

/**
 * Error information with line context
 */
export interface EnhancedError {
    message: string;
    line: number;
    column: number;
    lineContent: string;
    pointer: string;
}

/**
 * Function to get the specific line of SQL where an error occurs
 */
function getErrorLineContent(sql: string, lineNumber: number): string {
    const lines = sql.split('\n');
    return lineNumber > 0 && lineNumber <= lines.length
        ? lines[lineNumber - 1]
        : '';
}

/**
 * Creates a pointer string to visually indicate the error position
 */
function createErrorPointer(column: number): string {
    return ' '.repeat(column - 1) + '^';
}

/**
 * Enhanced validation of PostgreSQL query syntax with line context
 */
export function validatePostgresQuery(sql: string): {
    valid: boolean;
    errors: string[];
    enhancedErrors: EnhancedError[];
} {
    const tokens = tokenize(sql);
    const errors: string[] = [];
    const enhancedErrors: EnhancedError[] = [];

    // Basic structure validations
    let selectCount = 0;
    let fromCount = 0;
    let openParens = 0;
    let closeParens = 0;

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];

        // Track SELECT statements
        if (
            token.type === 'keyword' &&
            token.value.toUpperCase() === 'SELECT'
        ) {
            selectCount++;
        }

        // Track FROM clauses
        if (token.type === 'keyword' && token.value.toUpperCase() === 'FROM') {
            fromCount++;
        }

        // Track parentheses
        if (token.type === 'punctuation' && token.value === '(') {
            openParens++;
        }
        if (token.type === 'punctuation' && token.value === ')') {
            closeParens++;
            if (closeParens > openParens) {
                const errorMsg = `Unmatched closing parenthesis at line ${token.line}, column ${token.column}`;
                errors.push(errorMsg);

                enhancedErrors.push({
                    message: errorMsg,
                    line: token.line,
                    column: token.column,
                    lineContent: getErrorLineContent(sql, token.line),
                    pointer: createErrorPointer(token.column)
                });
            }
        }

        // Check for basic syntax errors
        if (token.type === 'keyword') {
            // Validate JOIN clauses have ON or USING
            if (/JOIN$/i.test(token.value)) {
                let hasOn = false;
                for (
                    let j = i + 1;
                    j < tokens.length &&
                    !(
                        tokens[j].type === 'keyword' &&
                        [
                            'SELECT',
                            'FROM',
                            'WHERE',
                            'GROUP',
                            'ORDER',
                            'LIMIT'
                        ].includes(tokens[j].value.toUpperCase())
                    );
                    j++
                ) {
                    if (
                        tokens[j].type === 'keyword' &&
                        (tokens[j].value.toUpperCase() === 'ON' ||
                            tokens[j].value.toUpperCase() === 'USING')
                    ) {
                        hasOn = true;
                        break;
                    }
                }
                if (!hasOn) {
                    const errorMsg = `JOIN without ON or USING clause at line ${token.line}, column ${token.column}`;
                    errors.push(errorMsg);

                    enhancedErrors.push({
                        message: errorMsg,
                        line: token.line,
                        column: token.column,
                        lineContent: getErrorLineContent(sql, token.line),
                        pointer: createErrorPointer(token.column)
                    });
                }
            }
        }
    }

    // Check for unmatched parentheses
    if (openParens !== closeParens) {
        const errorMsg = `Unmatched parentheses: ${openParens} opening vs ${closeParens} closing`;
        errors.push(errorMsg);

        // Try to find the last open parenthesis token to provide context
        let lastOpenParenToken: Token | null = null;
        for (let i = tokens.length - 1; i >= 0; i--) {
            if (tokens[i].type === 'punctuation' && tokens[i].value === '(') {
                lastOpenParenToken = tokens[i];
                break;
            }
        }

        if (lastOpenParenToken) {
            enhancedErrors.push({
                message: errorMsg,
                line: lastOpenParenToken.line,
                column: lastOpenParenToken.column,
                lineContent: getErrorLineContent(sql, lastOpenParenToken.line),
                pointer: createErrorPointer(lastOpenParenToken.column)
            });
        } else {
            // If we can't find a specific token, add a generic error
            enhancedErrors.push({
                message: errorMsg,
                line: 0,
                column: 0,
                lineContent: '',
                pointer: ''
            });
        }
    }

    // Check for basic query structure
    if (selectCount === 0) {
        const errorMsg = 'Query missing SELECT statement';
        errors.push(errorMsg);
        enhancedErrors.push({
            message: errorMsg,
            line: 0,
            column: 0,
            lineContent: sql.split('\n')[0] || '',
            pointer: ''
        });
    }

    if (selectCount > 0 && fromCount === 0) {
        // Find the SELECT token to provide context
        let selectToken: Token | null = null;
        for (const token of tokens) {
            if (
                token.type === 'keyword' &&
                token.value.toUpperCase() === 'SELECT'
            ) {
                selectToken = token;
                break;
            }
        }

        const errorMsg = 'SELECT statement without FROM clause';
        errors.push(errorMsg);

        if (selectToken) {
            enhancedErrors.push({
                message: errorMsg,
                line: selectToken.line,
                column: selectToken.column,
                lineContent: getErrorLineContent(sql, selectToken.line),
                pointer: createErrorPointer(selectToken.column)
            });
        } else {
            enhancedErrors.push({
                message: errorMsg,
                line: 0,
                column: 0,
                lineContent: '',
                pointer: ''
            });
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        enhancedErrors
    };
}

/**
 * Format error messages with line context for display
 */
export function formatErrorMessages(
    sql: string,
    { enhancedErrors }: ReturnType<typeof validatePostgresQuery>
): string[] {
    return enhancedErrors.map((error) => {
        if (error.line === 0) {
            return error.message;
        }

        return [
            `Error: ${error.message}`,
            `Line ${error.line}: ${error.lineContent}`,
            `${error.pointer}`
        ].join('\n');
    });
}
