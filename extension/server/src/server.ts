import {
    _Connection,
    createConnection,
    ProposedFeatures
} from 'vscode-languageserver/node.js';
import { URI } from 'vscode-uri';
import { CompilerProgram, createCompilerProgram } from '@sasql/core';

import { registerDocumentEventHandlers } from './handlers/register-document-event-handlers.js';
import { registerInitEvents } from './handlers/init.js';
import { resolveSasqlProjectConfig } from './resolve-sasql-project-config.js';
import { compileSasqlProgram } from './document-handlers/compile-program.js';
import { registerCompletionEventHandlers } from './examples/register-completion-event-handlers.js';

export let compilerProgram: CompilerProgram | null = null;

export const connection: Connection = createConnection(ProposedFeatures.all);
// prettier-ignore
export declare type Connection = _Connection<any, any, any, any, any, any, any, any>;

registerInitEvents(connection, (params) => {
    if (!params.workspaceFolders) {
        throw new Error('Extension not given access to workspace folders.');
    }

    const projectConfigs = resolveSasqlProjectConfig(
        params.workspaceFolders.map((folder) => {
            return URI.parse(folder.uri).fsPath;
        })
    );

    if (projectConfigs.length > 1) {
        throw new Error(
            'SASQL extension does not yet support multi-project workspaces.'
        );
    }

    compilerProgram = createCompilerProgram(projectConfigs[0].rootDir, {
        ignoreWhitespace: true,
        removeComments: true,
        programConfig: projectConfigs[0].config
    });
});

const { documents } = registerDocumentEventHandlers();

documents.listen(connection);
connection.listen();

registerCompletionEventHandlers(connection);

compileSasqlProgram();
