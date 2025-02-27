// Basic token types for SQL parsing
export type TokenType =
    | 'keyword'
    | 'identifier'
    | 'operator'
    | 'literal'
    | 'parameter'
    | 'comment'
    | 'whitespace'
    | 'punctuation';

export interface Token {
    type: TokenType;
    value: string;
    line: number;
    column: number;
}

// Common PostgreSQL keywords for validation
export const POSTGRES_KEYWORDS = new Set([
    'SELECT',
    'FROM',
    'WHERE',
    'JOIN',
    'LEFT',
    'RIGHT',
    'INNER',
    'OUTER',
    'ON',
    'AND',
    'OR',
    'NOT',
    'IN',
    'BETWEEN',
    'LIKE',
    'ORDER',
    'BY',
    'GROUP',
    'HAVING',
    'LIMIT',
    'OFFSET',
    'INSERT',
    'UPDATE',
    'DELETE',
    'CREATE',
    'ALTER',
    'DROP',
    'TABLE',
    'INDEX',
    'VIEW',
    'AS',
    'DISTINCT',
    'CASE',
    'WHEN',
    'THEN',
    'ELSE',
    'END',
    'NULL',
    'IS',
    'TRUE',
    'FALSE',
    'ASC',
    'DESC',
    'WITH',
    'UNION',
    'ALL',
    'INTERSECT',
    'EXCEPT',
    'EXISTS'
]);

// Common PostgreSQL operators for validation
export const POSTGRES_OPERATORS = new Set([
    '=',
    '<',
    '>',
    '<=',
    '>=',
    '<>',
    '!=',
    '+',
    '-',
    '*',
    '/',
    '%',
    '^',
    '||',
    '@>',
    '<@',
    '&&',
    '<<',
    '>>',
    '&<',
    '&>',
    '-|-',
    '~',
    '~*',
    '!~',
    '!~*',
    '@',
    '@@',
    '@@@'
]);
