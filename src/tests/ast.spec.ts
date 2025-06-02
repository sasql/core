import { parseToAST } from '../lib/ast.js';
import { tokenize } from '../lib/lexer.js';
import { testTmp } from './_test-files.js';

describe('AST test suite', () => {
    const { fsPath: mainPath, source: mainSasql } = testTmp.src.main_sasql;

    test('It can parse an AST', () => {
        const tokens = tokenize(mainSasql, mainPath, {
            ignoreWhitespace: true,
            includeComments: true
        });

        const ast = parseToAST(tokens.tokens, mainSasql, mainPath);

        console.log(ast);
    });
});
