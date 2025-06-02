import { useRegex } from '../lib/resolver/get-use-stmts.js';
import { Resolver } from '../lib/resolver.js';
import {
    createTestProject,
    removeTestProject,
    testTmp
} from './_test-files.js';

describe('Resolver test suite', () => {
    beforeAll(() => createTestProject());
    afterAll(() => removeTestProject());

    test('useRegex matches use statements', () => {
        expect(useRegex.test(testTmp.src.main_sasql.source)).toEqual(true);
    });

    it('Can resolve directives', () => {
        const resolver = new Resolver(
            JSON.parse(testTmp.config_json.source),
            testTmp.fsPath
        ).resolve();

        console.log(resolver);
    });
});
