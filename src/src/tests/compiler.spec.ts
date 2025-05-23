import { createCompilerProgram } from '../compiler/compiler.js';
import { sys } from '../compiler/sys.js';
import {
    mainSasql,
    subStmtSasql,
    virtualMainDir
} from './example-sasql.spec.js';

describe('Compiler V3 test suite', () => {
    afterEach(() => {
        // @todo - clearing mocks isn't working
        jest.clearAllMocks();
    });

    test('statements', () => {
        jest.spyOn(sys, 'readFile').mockImplementationOnce(() => subStmtSasql);
        jest.spyOn(sys, 'fileExists').mockImplementationOnce(() => true);

        const program = createCompilerProgram(virtualMainDir, {
            ignoreWhitespace: true,
            removeComments: true
        });

        const { output, formatted, diagnosticMessages, unknownExceptions } =
            program.compile();

        expect(diagnosticMessages.length).toEqual(0);
        expect(unknownExceptions.length).toEqual(0);

        expect(formatted.length).toEqual(0);
        expect(output.length).toEqual(0);

        expect(Object.keys(program.statements).length).toEqual(1);
        expect(program.statements['select_from_my_table']).toBeTruthy();
    });

    it('@use and @include', () => {
        jest.spyOn(sys, 'readFile').mockImplementationOnce(() => subStmtSasql);
        jest.spyOn(sys, 'fileExists').mockImplementation(() => true);

        const program = createCompilerProgram(virtualMainDir, {
            ignoreWhitespace: true,
            removeComments: true,
            entrySource: mainSasql
        });

        const { output, formatted, diagnosticMessages, unknownExceptions } =
            program.compile();

        expect(diagnosticMessages.length).toEqual(0);
        expect(unknownExceptions.length).toEqual(0);

        expect(formatted.length).toBeGreaterThan(0);
        expect(output.length).toBeGreaterThan(0);

        expect(Object.keys(program.statements).length).toEqual(0);

        expect(output).toEqual(
            `SELECT * FROM ( SELECT * FROM my_table WHERE column_a = $1 AND column_b = $2 ) as my_sub_stmt`
        );
    });

    it('Returns diagnostic message for unresolvable @use.', () => {
        // @todo - clearing mocks isn't working
        jest.spyOn(sys, 'fileExists').mockImplementation(() => false);

        const testErrorSasql = /*sql*/ `@use './does/not/exist' as does_not_exist;`;

        const program = createCompilerProgram(virtualMainDir, {
            ignoreWhitespace: true,
            removeComments: true,
            entrySource: testErrorSasql
        });

        const { diagnosticMessages } = program.compile();

        expect(diagnosticMessages.length).toEqual(1);
        expect(diagnosticMessages[0].message).toEqual(
            'Failed to resolve import.'
        );
    });

    it('Returns mutliple diagnostic messages for a file with multiple errors.', () => {
        // @todo - clearing mocks isn't working
        jest.spyOn(sys, 'fileExists').mockImplementation(() => false);

        const testErrorSasql = /*sql*/ `
            @use './does/not/exist' as does_not_exist;

            SELECT * FROM (
                @include can_not_exist.really_does_not_exist;
            )
        `;

        const program = createCompilerProgram(virtualMainDir, {
            ignoreWhitespace: true,
            removeComments: true,
            entrySource: testErrorSasql
        });

        const { diagnosticMessages } = program.compile();

        expect(diagnosticMessages.length).toEqual(2);
        expect(diagnosticMessages[0].message).toEqual(
            'Failed to resolve import.'
        );
        expect(diagnosticMessages[1].message).toEqual(
            'Failed to resolve module can_not_exist.'
        );
    });
});
