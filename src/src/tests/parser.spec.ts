import { parse } from '../compiler/parser.js';
import { tokenize } from '../compiler/tokenizer.js';
import { isIncludeDirectiveV2 } from '../compiler/types.js';
import {
    mainSasql,
    subStmtSasql,
    virtualDir,
    virtualMainDir
} from './example-sasql.spec.js';

describe('Parser V2 test suite.', () => {
    test('Can parse sasql with statement declaration', () => {
        const { tokens } = tokenize(subStmtSasql, virtualDir, {
            ignoreWhitespace: false
        });
        const parsed = parse(tokens, subStmtSasql, virtualDir);

        expect(parsed.chunks.length).toEqual(0);

        const declaredStatements = Object.keys(parsed.statements);

        expect(declaredStatements.length).toEqual(1);

        const key = declaredStatements[0];

        expect(key).toEqual('select_from_my_table');

        const declaration = parsed.statements[declaredStatements[0]];

        console.log(declaration);

        expect(declaration.stmtName.text).toEqual('select_from_my_table');

        expect(declaration.bracedExpression.length).toEqual(12);
        expect(declaration.commentBlock?.description).toBeTruthy();
        console.log(declaration.commentBlock?.description);
        expect(declaration.commentBlock?.description[0].text).toEqual('This');
        expect(declaration.commentBlock?.description.pop()!.text).toEqual('.');

        const [tag1, tag2] = declaration.commentBlock?.tags ?? [];

        expect(tag1.tagParam?.text).toEqual('$1');
        expect(tag2.tagParam?.text).toEqual('$2');
    });

    test('Can parse sasql with @use and @include directives', () => {
        const { tokens } = tokenize(mainSasql, virtualMainDir, {
            ignoreWhitespace: false
        });
        const { chunks, imports, statements } = parse(
            tokens,
            mainSasql,
            virtualMainDir
        );

        expect(chunks.length).toEqual(9);

        const stmtKeys = Object.keys(statements);
        expect(stmtKeys.length).toEqual(0);

        const importKeys = Object.keys(imports);
        expect(importKeys.length).toEqual(1);

        const imported = imports[importKeys[0]];
        expect(imported.alias.text).toEqual('my_import');
        expect(imported.path.text).toEqual("'./my_imported_select'");

        const include = chunks[5];

        if (!isIncludeDirectiveV2(include)) {
            console.log(include);
            throw new Error('Expected include directive, received a token.');
        }

        expect(include.module.text).toEqual('my_import');
        expect(include.import.text).toEqual('select_from_my_table');
    });
});
