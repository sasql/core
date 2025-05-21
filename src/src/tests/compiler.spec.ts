import { createCompilerProgram } from '../compiler-v2/compiler.js';
import { sys } from '../compiler-v2/sys.js';
import {
    mainSasql,
    subStmtSasql,
    virtualMainDir
} from './example-sasql.spec.js';

describe('Compiler V2 test suite', () => {
    test('Can compile sasql', () => {
        jest.spyOn(sys, 'readFile').mockImplementationOnce(() => subStmtSasql);
        jest.spyOn(sys, 'fileExists').mockImplementationOnce(() => true);

        const validationResults = createCompilerProgram(virtualMainDir, {
            ignoreWhitespace: true,
            removeComments: true,
            entrySource: subStmtSasql
        });

        console.log(validationResults.formatted);
    });

    test('Can compile sasql with @use and @include', () => {
        jest.spyOn(sys, 'readFile').mockImplementationOnce(() => subStmtSasql);
        jest.spyOn(sys, 'fileExists').mockImplementationOnce(() => true);

        const validationResults = createCompilerProgram(virtualMainDir, {
            ignoreWhitespace: true,
            removeComments: true,
            entrySource: mainSasql
        });

        console.log(validationResults.formatted);
    });
});
