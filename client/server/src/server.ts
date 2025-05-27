import {
    createConnection,
    ProposedFeatures
} from 'vscode-languageserver/node.js';

import { registerCompletionEventHandlers } from './register-completion-event-handlers.js';
import { registerConfigEventHandlers } from './register-config-event-handlers.js';
import { registerDocumentEventHandlers } from './register-document-event-handlers.js';
import { registerFileWatcherEventHandler } from './register-file-watcher-event-handler.js';
import { configFound, onInit } from './register-init-event-handlers.js';

import type { Settings } from './types.js';

export const connection = createConnection(ProposedFeatures.all);

export declare type Connection = typeof connection;

// The global settings, used when the `workspace/configuration` request
// is not supported by the client.
export const defaultSettings: Settings = { maxNumberOfProblems: 1000 };
export let globalSettings: Settings = defaultSettings;

configFound.on('configUrl', () => {});

onInit(connection);

const { documentSettings, documents } = registerDocumentEventHandlers();

registerConfigEventHandlers(
    connection,
    documentSettings,
    globalSettings,
    defaultSettings
);
registerCompletionEventHandlers(connection);
registerFileWatcherEventHandler(connection);

documents.listen(connection);
connection.listen();
