import { compile } from '../compiler-v2/compiler.js';
import {
    mainSasql,
    subStmtSasql,
    virtualMainDir
} from './example-sasql.spec.js';

describe('Compiler V2 test suite.', () => {
    test('Can compile sasql', () => {
        const validationResults = compile(
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

    test('Can compile sasql with @use and @include', () => {
        const validationResults = compile(
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
