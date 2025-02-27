import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const { defaultsESM: tsjPreset } = require('ts-jest/presets');

export default {
    ...tsjPreset,
    testEnvironment: 'node',
    extensionsToTreatAsEsm: ['.ts'],
    // Workaround so that imports of ".js" in TS files
    // will be mapped correctly in Jest's environment
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1'
    },
    transform: {
        '^.+\\.ts$': [
            'ts-jest',
            {
                useESM: true
            }
        ]
    }
};
