export const sasqlConfig = /*json*/ `
{
    "include": [
        "src/**/*.sasql"
    ]
}
`.trim();

export const subStmtSasql = /*sql*/ `
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

export const mainSasql = /*sql*/ `
@use './statements/statement' as my_import;

SELECT
    *
FROM
    (
        @include my_import.select_from_my_table;
    ) as my_sub_stmt
`;

export const errorMainSasql = /*sql*/ `
@use './statement' as my_import;

SELECT
    *
FROM
    (
        @include my_import.select_from_my_table;
    ) as my_sub_stmt
`;

export const virtualDir = '/home/usr/git/my-project/src/main.sasql';
export const virtualMainDir = '/home/usr/git/my-project/src/main.sasql';

export const tokenPosn = /*sql*/ `SELECT
*
FROM
(
    @include my_import.select_from_my_table;
) as my_sub_stmt`;
