// @ts-check

import { writeFileSync } from 'fs';
import { languageMeta } from './parts/meta.js';
import { patterns, patternsTop } from './parts/patterns.js';
import { repository } from './parts/repository.js';
import { getSasqlSyntax } from './sasql.js';
import { join } from 'path';

const tmLanguageJson = {
    ...languageMeta,
    patterns: [...patternsTop, ...getSasqlSyntax(), ...patterns],
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
