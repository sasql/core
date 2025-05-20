import { parseSourceFile } from '../compiler-v2/parser-source-file.js';
import {
    mainSasql,
    subStmtSasql,
    virtualMainDir
} from './example-sasql.spec.js';

describe('Validator test suite.', () => {
    test('Can validate SQL', () => {
        const validationResults = parseSourceFile(
            virtualMainDir,
            {
                ignoreWhitespace: true,
                removeComments: true
            },
            {
                readFile: () => subStmtSasql,
                fileExists: () => true
            },
            undefined
        );

        console.log(validationResults);
    });

    test('Can validate SQL with @include', () => {
        const validationResults = parseSourceFile(
            virtualMainDir,
            {
                ignoreWhitespace: true,
                removeComments: true
            },
            {
                readFile: () => subStmtSasql,
                fileExists: () => true
            },
            undefined,
            mainSasql
        );

        console.log(validationResults.toEmit);
    });
});
