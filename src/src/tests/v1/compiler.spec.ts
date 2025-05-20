import { compile } from '../../compiler/compiler.js';
import { parseSourceFile } from '../../compiler/parser.js';
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
