import { argv } from 'process';
import { hideBin } from 'yargs/helpers';
import * as sasql from '@sasql/core';

import { buildCli, buildProject } from './cli.js';
import { resolve } from 'path';

exec();

function exec() {
    const args = hideBin(argv);

    if (args.includes('--help') || args.includes('-h')) {
        buildCli(args).parseSync();
        return;
    }

    const configName = sasql.findProjectConfig(resolve());
    const config = sasql.readProjectConfig(configName);

    if (config && args.length === 0) {
        buildProject();
    } else {
        buildCli(args).parseSync();
    }
}
