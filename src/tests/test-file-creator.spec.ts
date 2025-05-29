import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
import {
    errorMainSasql,
    mainSasql,
    sasqlConfig,
    subStmtSasql
} from './example-sasql.spec.js';

export const rootDir = resolve('.test');
const srcDir = join(rootDir, 'src');
const stmtsDir = join(srcDir, 'statements');
const configPath = join(rootDir, 'sasqlconfig.json');
const mainPath = join(srcDir, 'main.sasql');
const stmtsPath = join(stmtsDir, 'statement.sasql');

export function createTestProject(writeErrored = false) {
    if (!existsSync(stmtsDir)) {
        mkdirSync(stmtsDir, { recursive: true });
    }

    if (!existsSync(configPath)) {
        writeFileSync(configPath, sasqlConfig);
    }

    if (!existsSync(mainPath)) {
        writeFileSync(mainPath, writeErrored ? errorMainSasql : mainSasql);
    }

    if (!existsSync(stmtsPath)) {
        writeFileSync(stmtsPath, subStmtSasql);
    }
}

export function removeTestProject() {
    if (existsSync(rootDir)) {
        rmSync(rootDir, { recursive: true });
    }
}
