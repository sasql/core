import { isToken, isUseDirective } from '../lib/types.js';
import { testTmp } from './_test-files.js';
import { parseAndTokenize } from './parser.spec.js';

describe('Lookup test suite', () => {
    test('it can find tokens given a position', () => {
        const { fsPath: mainPath, source: mainSasql } = testTmp.src.main_sasql;

        const { positions } = parseAndTokenize(mainSasql, mainPath);

        const select = positions.getAtPosn(3, 3);
        if (!isToken(select)) {
            throw new Error(
                'Exected token, received ' + JSON.stringify(select)
            );
        }
        expect(select.text).toEqual('SELECT');

        const use = positions.getAtPosn(1, 15);
        if (!isUseDirective(use)) {
            throw new Error(
                'Expected use directive, received ' + JSON.stringify(use)
            );
        }
        expect(use.alias.text).toEqual('my_import');
    });
});
