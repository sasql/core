// @ts-check

import { writeFileSync } from 'fs';
import { join } from 'path';

import { patterns } from './patterns/index.js';
import { repository } from './repository/index.js';

const tmLanguageJson = {
    $schema:
        'https://raw.githubusercontent.com/martinring/tmlanguage/master/tmlanguage.json',
    version: '0.0.1',
    name: 'SASQL',
    scopeName: 'source.sasql',
    patterns,
    repository
};

const outPath = join(
    import.meta.dirname,
    '..',
    '..',
    '..',
    'syntaxes',
    'sasql.tmLanguage.json'
);

writeFileSync(outPath, JSON.stringify(tmLanguageJson, null, 4));
