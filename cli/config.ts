import { existsSync } from 'fs';
import { dirname, join, resolve } from 'path';
import type {
    DataTypeCase,
    FormatOptionsWithLanguage,
    FunctionCase,
    IdentifierCase,
    IndentStyle,
    KeywordCase,
    LogicalOperatorNewline,
    SqlLanguage
} from 'sql-formatter';

export declare interface SasqlConfig {
    include: string[];
    exclude: string[];
    compilerOptions: CompilerOptions;
}

export declare interface ProgramOptions {
    removeComments?: boolean;
}

export declare interface CompilerOptions extends ProgramOptions {
    rootDir?: string;
    outDir?: string;
    language?: SqlLanguage;
    tabWidth?: number;
    useTabs?: boolean;
    keywordCase?: KeywordCase;
    identifierCase?: IdentifierCase;
    dataTypeCase?: DataTypeCase;
    functionCase?: FunctionCase;
    indentStyle?: IndentStyle;
    logicalOperatorNewline?: LogicalOperatorNewline;
    expressionWidth?: number;
    linesBetweenQueries?: number;
    denseOperators?: boolean;
    newlineBeforeSemicolon?: boolean;
}

const sqlFormatterOptionsKeys: (keyof CompilerOptions)[] = [
    'language',
    'tabWidth',
    'useTabs',
    'keywordCase',
    'identifierCase',
    'dataTypeCase',
    'functionCase',
    'indentStyle',
    'logicalOperatorNewline',
    'expressionWidth',
    'linesBetweenQueries',
    'denseOperators',
    'newlineBeforeSemicolon'
];

export function findConfig(configFileName?: string) {
    const path = resolve(configFileName ?? 'sasqlconfig.json');

    try {
        return findBack(path);
    } catch (e) {
        throw new Error('Failed to locate sasqlconfig.json file.');
    }

    function findBack(dir: string) {
        let sasqlPath = dir;

        if (!sasqlPath.endsWith('.json')) {
            sasqlPath = join(dir, 'sasqlconfig.json');
        }

        if (existsSync(sasqlPath)) {
            return sasqlPath;
        }

        return findBack(dirname(dir));
    }
}

export function readConfigFile(
    srcDir: string,
    readFn: (path: string, encoding?: string | undefined) => string | undefined
): SasqlConfig {
    const srcFile = readFn(srcDir);
    if (!srcFile) {
        throw new Error('Failed to read src file.');
    }
    return JSON.parse(srcFile);
}

export declare interface CommandLineArguments extends CompilerOptions {
    src?: string;
}

export declare interface ProgramConfiguration {
    include: string[];
    outDir: string;
    formatOptions: FormatOptionsWithLanguage;
    programOptions: ProgramOptions;
}

export function parseCommandLineArguments(
    { compilerOptions, exclude, include }: Partial<SasqlConfig>,
    src?: string,
    cliArgs: CompilerOptions = {}
): ProgramConfiguration {
    //  Resolve root dir

    let rootDir: string;

    if (compilerOptions?.rootDir) {
        rootDir = resolve(compilerOptions.rootDir);
    } else {
        rootDir = resolve();
    }

    // Resolve options

    include ??= [];
    exclude ??= [];

    // Resolve sources

    if (src) {
        include = [src];
    } else if (include.length === 0) {
        throw new Error('Must specify one or more .sasql files to include.');
    }

    include = include.map((p) => join(rootDir, p));

    // Resolve compiler options

    compilerOptions ??= {};

    // Resolve out directory

    let outDir: string;

    if (cliArgs.outDir) {
        outDir = join(rootDir, cliArgs.outDir);
    } else if (compilerOptions?.outDir) {
        outDir = join(rootDir, compilerOptions.outDir);
    } else {
        outDir = join(rootDir, 'dist');
    }

    // Build format options

    const formatOptions: FormatOptionsWithLanguage = {};

    sqlFormatterOptionsKeys.forEach((k) => {
        if (compilerOptions[k]) formatOptions[k] = compilerOptions[k];
        if (cliArgs[k]) formatOptions[k] = cliArgs[k];
    });

    // Build program options

    const programOptions: ProgramOptions = {
        removeComments: compilerOptions.removeComments
    };

    return { include, outDir, formatOptions, programOptions };
}
