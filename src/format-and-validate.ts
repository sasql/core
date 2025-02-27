import { formatPostgresQuery } from './formatter.js';
import { validatePostgresQuery, formatErrorMessages } from './validate.js';

/**
 * Main function to validate and format a PostgreSQL query with enhanced error reporting
 */
export function formatAndValidatePostgresQuery(sql: string): {
    formatted: string;
    valid: boolean;
    errors: string[];
    formattedErrors: string[];
} {
    const validation = validatePostgresQuery(sql);
    const formatted = validation.valid ? formatPostgresQuery(sql) : sql;
    const formattedErrors = formatErrorMessages(sql, validation);

    return {
        formatted,
        valid: validation.valid,
        errors: validation.errors,
        formattedErrors
    };
}
