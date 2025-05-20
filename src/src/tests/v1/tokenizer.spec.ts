import { tokenize } from '../../compiler/tokenizer.js';
import { mainSasql, subStmtSasql } from '../example-sasql.spec.js';

describe('Tokenizer test suite', () => {
    test('It can parse a simple example sql', () => {
        const tokens = tokenize(mainSasql);

        expect(tokens.length).toEqual(7);

        const [nl1, use, nl2, comment, select, include, nl3] = tokens;

        expect(nl1.text).toEqual(
            mainSasql.substring(nl1.startIndex, nl1.endIndex)
        );
        expect(use.text).toEqual(
            mainSasql.substring(use.startIndex, use.endIndex)
        );
        expect(nl2.text).toEqual(
            mainSasql.substring(nl2.startIndex, nl2.endIndex)
        );
        expect(comment.text).toEqual(
            mainSasql.substring(comment.startIndex, comment.endIndex)
        );
        expect(select.text).toEqual(
            mainSasql.substring(select.startIndex, select.endIndex)
        );
        expect(include.text).toEqual(
            mainSasql.substring(include.startIndex, include.endIndex)
        );
        expect(nl3.text).toEqual(
            mainSasql.substring(nl3.startIndex, nl3.endIndex)
        );
    });

    test('It can parse a function with a statement directive', () => {
        const tokens = tokenize(subStmtSasql);
        console.log(tokens);
    });
});
