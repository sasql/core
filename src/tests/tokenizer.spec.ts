import { tokenize } from '../lib/tokenizer.js';
import { TestFile, testTmp } from './_test-files.js';

describe('Tokenizer v2 test suite', () => {
    test('Can tokenize sasql that has an import and include.', () => {
        const tokenized = tokenize(
            testTmp.src.main_sasql.source,
            testTmp.src.main_sasql.fsPath,
            {
                ignoreWhitespace: true
            }
        );

        const expectedTokenVals = [
            '@use',
            "'./my_imported_select'",
            'as',
            'my_import',
            ';',
            'SELECT',
            '*',
            'FROM',
            '(',
            '@include',
            'my_import',
            '.',
            'select_from_my_table',
            ';',
            ')',
            'as',
            'my_sub_stmt'
        ];

        tokenized.tokens.forEach((t, i) => {
            expect(t.text).toEqual(expectedTokenVals[i]);
        });
    });

    test('Can tokenize sql that defines a stmt', () => {
        const tokenized = tokenize(
            testTmp.src.statements.stmt_sasql.source,
            testTmp.src.statements.stmt_sasql.fsPath,
            {
                ignoreWhitespace: true
            }
        );

        const expectedTokenVals = [
            '/**',
            '*',
            'This',
            'is',
            'the',
            'overall',
            'description',
            'of',
            'the',
            'stmt',
            '.',
            '*',
            '@param',
            '{',
            'string',
            '}',
            '$1',
            '-',
            'The',
            'first',
            'parameter',
            '*',
            '@param',
            '{',
            'string',
            '|',
            'number',
            '}',
            '$2',
            '-',
            'The',
            'second',
            'parameter',
            '*/',
            '@statement',
            'select_from_my_table',
            '{',
            'SELECT',
            '*',
            'FROM',
            'my_table',
            'WHERE',
            'column_a',
            '=',
            '$1',
            'AND',
            'column_b',
            '=',
            '$2',
            '}'
        ];

        tokenized.tokens.forEach((t, i) => {
            expect(t.text).toEqual(expectedTokenVals[i]);
        });
    });

    test('Records the correct token positions', () => {
        testTokenPosns(testTmp.src.main_sasql);
        testTokenPosns(testTmp.src.statements.stmt_sasql);
    });

    function testTokenPosns({ fsPath, source }: TestFile) {
        const tokenized = tokenize(source, fsPath, {
            ignoreWhitespace: true
        });

        const lns = source.split(/\n/g);

        tokenized.tokens.forEach((t) => {
            expect(source.substring(t.startIndex, t.endIndex)).toEqual(t.text);

            const ln = lns[t.start.line - 1];
            const text = ln.substring(
                t.start.character - 1,
                t.end.character - 1
            );

            expect(t.text).toEqual(text);
        });
    }
});
