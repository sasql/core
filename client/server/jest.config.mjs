import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { defaultsESM: tsjPreset } = require('ts-jest/presets');

export default {
  ...tsjPreset,

  testEnvironment: 'node',

  // Tell Jest to handle ".ts" files as ESM
  extensionsToTreatAsEsm: ['.ts'],

  // Workaround for TS ESM => import "<file>.js"
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },

  // Instead of "globals.ts-jest", put config here:
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true
      }
    ]
  }
};