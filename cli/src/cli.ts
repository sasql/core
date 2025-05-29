import chalk from 'chalk';
import yargs from 'yargs';
import { readFileSync } from 'fs';
import { dirname, join, resolve } from 'path';

import * as sasql from '@sasql/core';

export function buildCli(argv: string[]) {
    return yargs(argv).command(
        '$0',
        'Build SASQL code',
        (yargs) => yargs.version(getVersion()).help(),
        () => {
            // @to-do execute program
            buildProject();
        }
    );
}

export function buildProject() {
    try {
        const config = sasql.findProjectConfig(resolve());
        const compilerProgram = sasql.createCompilerProgram(dirname(config));
        const output = compilerProgram.compileProject();
        console.log(output);
    } catch {
        console.error(
            chalk.red(
                'This project must be run in a directory that contains a sasqlconfig.json file.'
            )
        );
    }
}

function getVersion() {
    const dirname = import.meta.dirname;
    let npmConf = readFileSync(join(dirname, '../package.json'), 'utf-8');
    npmConf = JSON.parse(npmConf);
    return npmConf['version'];
}

// const keywordCase: KeywordCase[] = ['preserve', 'upper', 'lower'];
// const identifierCase = keywordCase;
// const dataTypeCase = keywordCase;
// const functionCase = keywordCase;
// const indentStyle: IndentStyle[] = ['standard', 'tabularLeft', 'tabularRight'];
// const logicalOperatorNewline: LogicalOperatorNewline[] = ['before', 'after'];

// function buildCommand(yargs: Argv) {
//     return yargs
//         .positional('src', {
//             type: 'string',
//             describe: 'Provide the path to the root file to build.',
//             coerce: (src) => {
//                 src = resolve(src);
//                 if (!existsSync(src)) {
//                     console.error(chalk.red('File does not exist at ' + src));
//                     exit();
//                 }
//                 return src;
//             }
//         })

//         .group(['rootDir', 'outDir'], 'Compiler Options')
//         .option('rootDir', {
//             type: 'string',
//             describe: 'Specify the root dir of the project code.',
//             default: resolve()
//         })
//         .option('outDir', {
//             type: 'string',
//             describe: 'Specify the outdir of the compiled code.',
//             default: resolve('dist'),
//             coerce: (src) => {
//                 src = resolve(src);

//                 return src;
//             }
//         })

//         .group(
//             [
//                 'language',
//                 'tabWidth',
//                 'useTabs',
//                 'keywordCase',
//                 'identifierCase',
//                 'dataTypeCase',
//                 'functionCase',
//                 'indentStyle',
//                 'logicalOperatorNewline',
//                 'expressionWidth',
//                 'linesBetweenQueries',
//                 'denseOperators',
//                 'newlineBeforeSemicolon'
//             ],
//             'Formatting Options'
//         )
//         .option('language', {
//             type: 'string',
//             describe: 'Specify the format language',
//             choices: supportedDialects,
//             default: 'postgresql',
//             coerce: (type) => <SqlLanguage>type
//         })
//         .option('tabWidth', {
//             type: 'number',
//             default: 4
//         })
//         .option('useTabs', {
//             type: 'boolean',
//             default: false
//         })
//         .option('keywordCase', {
//             type: 'string',
//             choices: keywordCase
//         })
//         .option('identifierCase', {
//             type: 'string',
//             choices: identifierCase
//         })
//         .option('dataTypeCase', {
//             type: 'string',
//             choices: dataTypeCase
//         })
//         .option('functionCase', {
//             type: 'string',
//             choices: functionCase
//         })
//         .option('indentStyle', {
//             type: 'string',
//             choices: indentStyle
//         })
//         .option('logicalOperatorNewline', {
//             type: 'string',
//             choices: logicalOperatorNewline
//         })
//         .option('expressionWidth', {
//             type: 'number'
//         })
//         .option('linesBetweenQueries', {
//             type: 'number'
//         })
//         .option('denseOperators', {
//             type: 'boolean'
//         })
//         .option('newlineBeforeSemicolon', {
//             type: 'boolean'
//         })

//         .version(getVersion())
//         .help();
// }
