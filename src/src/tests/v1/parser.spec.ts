import { parseSourceFile } from '../../compiler-v1/parser.js';
import { mainSasql, subStmtSasql, virtualDir } from '../example-sasql.spec.js';

describe('Parser test suite', () => {
    test('It can parse simple document.', () => {
        const sourceFile = parseSourceFile(
            mainSasql,
            virtualDir,
            () => subStmtSasql
        );

        // console.log(JSON.stringify(sourceFile, null, 4));
        console.log(sourceFile.diagnosticMessages);
    });

    test('It can parse document with statement', () => {
        const sourceFile = parseSourceFile(subStmtSasql, virtualDir);
        console.log(sourceFile);
        expect(sourceFile.statements['select_from_my_table']).toBeTruthy();
    });
});
