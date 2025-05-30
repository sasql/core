import { getIncludeStmts } from '../../lib/resolver/get-include-stmts.js';
import { mainSasql } from '../example-sasql.spec.js';

describe('Include stmt resolver test suite', () => {
    it('Can resolve include stmts', () => {
        getIncludeStmts(mainSasql);
    });
});
