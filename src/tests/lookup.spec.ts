import { isToken, isUseDirective } from '../lib/types.js';
import { mainSasql, virtualMainDir } from './example-sasql.spec.js';
import { parseAndTokenize } from './parser.spec.js';

describe('Lookup test suite', () => {
    test('it can find tokens given a position', () => {
        const { positions } = parseAndTokenize(mainSasql, virtualMainDir);

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
