import { tokenize } from '../compiler-v2/tokenizer.js';
import { mainSasql, subStmtSasql } from './example-sasql.spec.js';

describe('Tokenizer v2 test suite', () => {
    test('Can tokenize sasql that has an import and include.', () => {
        const tokenized = tokenize(mainSasql, {
            tokenizeWhitespace: false
        });

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

        tokenized.forEach((t, i) => {
            expect(t.text).toEqual(expectedTokenVals[i]);
        });
    });

    test('Can tokenize sql that defines a stmt', () => {
        const tokenized = tokenize(subStmtSasql, {
            tokenizeWhitespace: false
        });

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

        tokenized.forEach((t, i) => {
            expect(t.text).toEqual(expectedTokenVals[i]);
        });
    });

    test('Can parse comment line', () => {
        const commentLn = /*sql*/ `
            --comment line
        `;

        const tokenized = tokenize(commentLn, {
            tokenizeWhitespace: false
        });

        expect(tokenized[0].text).toEqual('--comment line');
    });
});
