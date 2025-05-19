import { argv } from 'process';

//@ts-ignore
import { hideBin } from 'yargs/helpers';
import ts from 'typescript';

import {
    findConfig,
    parseCommandLineArguments,
    readConfigFile
} from './config.js';
import { buildCli } from './cli.js';
// import { createBuilder } from '../builder.js';

exec();

function exec() {
    const args = hideBin(argv);

    if (args.includes('--help') || args.includes('-h')) {
        buildCli(args).parseSync();
        return;
    }

    const configName = findConfig();
    const config = readConfigFile(configName, ts.sys.readFile);

    if (config && args.length === 0) {
        // const programConfig =
        parseCommandLineArguments(config);
        // createBuilder(programConfig);
    } else {
        buildCli(args, config).parseSync();
    }
}
