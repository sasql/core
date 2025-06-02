import { getIncludeStmts } from '../../lib/resolver/get-include-stmts.js';
import { mainSasql } from '../_test-files.js';

describe('Include stmt resolver test suite', () => {
    it('Can resolve include stmts', () => {
        getIncludeStmts(mainSasql);
    });
});
