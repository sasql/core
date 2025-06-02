import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';

const mainSrc = `
@use './statements/statement' as my_import;

SELECT
    *
FROM
    (
        @include my_import.select_from_my_table;
    ) as my_sub_stmt
`;

const mainSrcError = `
@use './statement' as my_import;

SELECT
    *
FROM
    (
        @include my_import.select_from_my_table;
    ) as my_sub_stmt
`;

const statementSasql = `
/**
 * This is the overall description of the stmt.
 * @param {string} $1 - The first parameter
 * @param {string | number} $2 - The second parameter
 */
@statement select_from_my_table {
    SELECT
        *
    FROM
        my_table
    WHERE
        column_a = $1
        AND column_b = $2
}
`;

const rootDir = resolve('.test');

export declare interface TestFile {
    fsPath: string;
    source: string;
    [other: string]: any;
}

/**
 * Test project root directory
 * ```
 * .test/
 * ├─ sasqlconfig.json
 * └─ src/
 *    ├─ statements/
 *    │  └─ statement.sasql
 *    └─ main.sasql
 * ```
 */
export const testTmp = {
    fsPath: rootDir,
    config_json: {
        fsPath: join(rootDir, 'sasqlconfig.json'),
        source: JSON.stringify(
            {
                include: ['src/**/*.sasql']
            },
            null,
            4
        )
    },
    src: {
        fsPath: join(rootDir, 'src'),
        main_sasql: {
            fsPath: join(rootDir, 'src', 'main.sasql'),
            source: mainSrc,
            error: mainSrcError
        },
        statements: {
            fsPath: join(rootDir, 'src', 'statements'),
            stmt_sasql: {
                fsPath: join(rootDir, 'src', 'statements', 'statement.sasql'),
                source: statementSasql
            }
        }
    }
};

export function createTestProject(writeErrored = false) {
    if (!existsSync(testTmp.src.statements.fsPath)) {
        mkdirSync(testTmp.src.statements.fsPath, { recursive: true });
    }

    if (!existsSync(testTmp.config_json.fsPath)) {
        writeFileSync(testTmp.config_json.fsPath, testTmp.config_json.source);
    }

    if (!existsSync(testTmp.src.main_sasql.fsPath)) {
        writeFileSync(
            testTmp.src.main_sasql.fsPath,
            writeErrored
                ? testTmp.src.main_sasql.error
                : testTmp.src.main_sasql.source
        );
    }

    if (!existsSync(testTmp.src.statements.stmt_sasql.fsPath)) {
        writeFileSync(
            testTmp.src.statements.stmt_sasql.fsPath,
            testTmp.src.statements.stmt_sasql.source
        );
    }
}

export function removeTestProject() {
    if (existsSync(rootDir)) {
        rmSync(rootDir, { recursive: true });
    }
}

//
// Token Posn Example (No Padding)
//

export const tokenPosn = `SELECT
*
FROM
(
    @include my_import.select_from_my_table;
) as my_sub_stmt`;

//
// Has local statement
//

export const withLocalStmt = `
    @statement my_statement {
        SELECT * FROM my_schema.my_table
    }

    @include my_statement;
`;
