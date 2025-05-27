import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
import { mainSasql, sasqlConfig, subStmtSasql } from './example-sasql.spec.js';

const rootDir = resolve('.test');

export function createTestProject() {
    const srcDir = join(rootDir, 'src');
    const stmtsDir = join(srcDir, 'statements');

    if (!existsSync(stmtsDir)) {
        mkdirSync(stmtsDir, { recursive: true });
    }

    const configPath = join(rootDir, 'sasqlconfig.json');
    if (!existsSync(configPath)) {
        writeFileSync(configPath, sasqlConfig);
    }

    const mainPath = join(srcDir, 'main.sasql');
    if (!existsSync(mainPath)) {
        writeFileSync(mainPath, mainSasql);
    }

    const stmtsPath = join(stmtsDir, 'statement.sasql');
    if (!existsSync(stmtsPath)) {
        writeFileSync(stmtsPath, subStmtSasql);
    }
}

export function removeTestProject() {
    if (existsSync(rootDir)) {
        rmSync(rootDir, { recursive: true });
    }
}
