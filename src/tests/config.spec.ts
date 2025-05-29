import { resolve } from 'path';
import {
    findProjectConfig,
    readProjectConfig,
    resolveProjectFiles
} from '../lib/config.js';
import { sys } from '../lib/sys.js';
import {
    createTestProject,
    removeTestProject
} from './test-file-creator.spec.js';

describe('Config test suite', () => {
    beforeAll(() => createTestProject());
    afterAll(() => removeTestProject());

    it('Can resolve project root', () => {
        const projectRoot = findProjectConfig(
            resolve('.test', 'src', 'statements')
        );

        expect(projectRoot).toBeTruthy();
        expect(projectRoot).toEqual(resolve('.test', 'sasqlconfig.json'));
    });

    it('Can read project config', () => {
        const projectRoot = readProjectConfig(
            resolve('.test', 'sasqlconfig.json')
        );
        expect(projectRoot.include[0]).toEqual('src/**/*.sasql');
    });

    it('Can resolve all project files', () => {
        const configPath = resolve('.test', 'sasqlconfig.json');
        const paths = resolveProjectFiles(
            resolve('.test'),
            readProjectConfig(configPath)
        );
        expect(paths.length).toEqual(2);
        paths.forEach((p) => {
            expect(sys.fileExists(p.srcPath)).toEqual(true);
        });
    });
});
