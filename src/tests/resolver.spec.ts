import { resolve } from 'path';
import {
    createResolver,
    getUseStmts,
    matchAllUseStmts,
    useRegex
} from '../lib/resolver.js';
import { mainSasql } from './example-sasql.spec.js';
import {
    createTestProject,
    removeTestProject
} from './test-file-creator.spec.js';

describe('Resolver test suite', () => {
    beforeAll(() => createTestProject());
    afterAll(() => removeTestProject());

    test('useRegex matches use statements', () => {
        expect(useRegex.test(mainSasql)).toEqual(true);
    });

    it('can match all instances of use directive', () => {
        const results = matchAllUseStmts(mainSasql);
        expect(results.length).toEqual(1);

        const expectedMatch = results[0];

        expect(expectedMatch).toBeTruthy();

        const [stmt, path, alias] = expectedMatch;

        expect(stmt).toEqual(`@use './my_imported_select' as my_import;`);
        expect(path).toEqual('./my_imported_select');
        expect(alias).toEqual('my_import');
    });

    it('can parse all use directives', () => {
        const results = getUseStmts(mainSasql);
        expect(results.length).toEqual(1);
        results.forEach((result) => {
            expect(result.alias).toBeTruthy();
            expect(result.path).toBeTruthy();
        });
        expect(results[0].alias).toEqual('my_import');
        expect(results[0].path).toEqual('./my_imported_select');
    });

    it('Can resolve all entry points', () => {
        // jest.spyOn(sys, 'readFile').mockImplementationOnce(() => subStmtSasql);
        // jest.spyOn(sys, 'fileExists').mockImplementation(() => true);

        const mainPath = resolve('.test');

        const resolver = createResolver(mainPath);

        console.log(resolver);
    });
});
