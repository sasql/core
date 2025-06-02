import { tokenize } from '../lib/lexer.js';
import { testTmp } from './_test-files.js';

describe('Lexer test suite', () => {
    const { fsPath: mainPath, source: mainSasql } = testTmp.src.main_sasql;
    const { fsPath: stmtsPath, source: statementSasql } =
        testTmp.src.statements.stmt_sasql;

    test('Can tokenize sasql that has an import and include.', () => {
        const tokenized = tokenize(mainSasql, mainPath, {
            ignoreWhitespace: true
        });

        console.log(tokenized);

        // const expectedTokenVals = [
        //     '@use',
        //     "'./my_imported_select'",
        //     'as',
        //     'my_import',
        //     ';',
        //     'SELECT',
        //     '*',
        //     'FROM',
        //     '(',
        //     '@include',
        //     'my_import',
        //     '.',
        //     'select_from_my_table',
        //     ';',
        //     ')',
        //     'as',
        //     'my_sub_stmt'
        // ];

        // tokenized.tokens.forEach((t, i) => {
        //     expect(t.text).toEqual(expectedTokenVals[i]);
        // });
    });

    test('Can tokenize sql that defines a stmt', () => {
        const tokenized = tokenize(statementSasql, stmtsPath, {
            ignoreWhitespace: true,
            includeComments: true
        });

        console.log(tokenized);

        // const expectedTokenVals = [
        //     '/**',
        //     '*',
        //     'This',
        //     'is',
        //     'the',
        //     'overall',
        //     'description',
        //     'of',
        //     'the',
        //     'stmt',
        //     '.',
        //     '*',
        //     '@param',
        //     '{',
        //     'string',
        //     '}',
        //     '$1',
        //     '-',
        //     'The',
        //     'first',
        //     'parameter',
        //     '*',
        //     '@param',
        //     '{',
        //     'string',
        //     '|',
        //     'number',
        //     '}',
        //     '$2',
        //     '-',
        //     'The',
        //     'second',
        //     'parameter',
        //     '*/',
        //     '@statement',
        //     'select_from_my_table',
        //     '{',
        //     'SELECT',
        //     '*',
        //     'FROM',
        //     'my_table',
        //     'WHERE',
        //     'column_a',
        //     '=',
        //     '$1',
        //     'AND',
        //     'column_b',
        //     '=',
        //     '$2',
        //     '}'
        // ];

        // tokenized.tokens.forEach((t, i) => {
        //     expect(t.text).toEqual(expectedTokenVals[i]);
        // });
    });

    test('Records the correct token positions', () => {
        testTokenPosns(mainSasql, mainPath);
        testTokenPosns(statementSasql, stmtsPath);
    });

    function testTokenPosns(sasql: string, path: string) {
        const tokenized = tokenize(sasql, path, {
            ignoreWhitespace: true
        });

        const lns = sasql.split(/\n/g);

        tokenized.tokens.forEach((t) => {
            expect(sasql.substring(t.startIndex, t.endIndex)).toEqual(t.text);

            const ln = lns[t.start.line - 1];
            const text = ln.substring(
                t.start.character - 1,
                t.end.character - 1
            );

            expect(t.text).toEqual(text);
        });
    }
});
