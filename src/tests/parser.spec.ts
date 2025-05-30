import { parse } from '../lib/parser.js';
import { tokenize } from '../lib/tokenizer.js';
import { isIncludeDirective } from '../lib/types.js';
import {
    mainSasql,
    subStmtSasql,
    virtualDir,
    virtualMainDir,
    withLocalModule
} from './example-sasql.spec.js';
import { expect2 } from './util.spec.js';

describe('Parser V2 test suite.', () => {
    test('Can parse sasql with statement declaration', () => {
        const { tokens } = tokenize(subStmtSasql, virtualDir, {
            ignoreWhitespace: true
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
        expect(declaration.commentBlock?.description[0].text).toBeFalsy();
        expect(declaration.commentBlock?.description.pop()!.text).toEqual('.');

        const [tag1, tag2] = declaration.commentBlock?.tags ?? [];

        expect(tag1.tagParam?.text).toEqual('$1');
        expect(tag2.tagParam?.text).toEqual('$2');
    });

    test('Can parse sasql with @use and @include directives', () => {
        const { tokens } = tokenize(mainSasql, virtualMainDir, {
            ignoreWhitespace: true
        });

        const { chunks, imports, statements } = parse(
            tokens,
            mainSasql,
            virtualMainDir
        );

        expect(chunks.length).toEqual(8);

        const stmtKeys = Object.keys(statements);
        expect(stmtKeys.length).toEqual(0);

        const importKeys = Object.keys(imports);
        expect(importKeys.length).toEqual(1);

        const imported = imports[importKeys[0]];
        expect(imported.alias.text).toEqual('my_import');
        expect(imported.path.text).toEqual("'./statements/statement'");

        const include = chunks[4];

        if (!isIncludeDirective(include)) {
            console.log(include);
            throw new Error('Expected include directive, received a token.');
        }

        if (!include.module) {
            throw new Error('Expected token, received string.');
        }

        expect(include.module.text).toEqual('my_import');
        expect(include.import.text).toEqual('select_from_my_table');
    });

    it('Can tokenize and parse a file with a local statement', () => {
        const {
            chunks,
            imports,
            statements,
            diagnosticMessages,
            unknownExceptions
        } = parseAndTokenize(withLocalModule, virtualDir);

        expect2(diagnosticMessages).toHaveLengthOf(0);
        expect2(unknownExceptions).toHaveLengthOf(0);

        expect2(statements).toHaveLengthOf(1);

        expect2(imports).toHaveLengthOf(0);

        expect2(chunks).toHaveLengthOf(1);
    });

    it('Caches token posns', () => {
        const output = parseAndTokenize(mainSasql, virtualMainDir);
        console.log(output.positions);
    });
});

export function parseAndTokenize(source: string, virtualDir: string) {
    const { tokens } = tokenize(source, virtualDir, {
        ignoreWhitespace: true
    });

    return parse(tokens, source, virtualDir);
}
