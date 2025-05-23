import { compile } from '../../compiler-v1/compiler.js';
import { parseSourceFile } from '../../compiler-v1/parser.js';
import { mainSasql, subStmtSasql } from '../example-sasql.spec.js';

describe('Compiler test suite', () => {
    test('It can parse simple document.', () => {
        const sourceFile = parseSourceFile(
            mainSasql,
            '/home/usr/git/my-project/src/main.sasql',
            () => subStmtSasql
        );

        const output = compile(sourceFile);

        console.log(output.emit);
    });
});
