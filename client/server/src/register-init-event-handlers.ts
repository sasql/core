import {
    DidChangeConfigurationNotification,
    InitializeParams,
    InitializeResult,
    TextDocumentSyncKind
} from 'vscode-languageserver';
import { Connection } from './server.js';
import { URI } from 'vscode-uri';
import { join } from 'path';
import { existsSync } from 'fs';
import { EventEmitter } from 'events';
import { readProjectConfig, resolveProjectFiles } from '@sasql/core';

export const serverConfig = {
    configuration: false,
    workspaceFolder: true,
    diagnosticRelatedInfo: false
};

export let configLocation: string | null = null;

export const configFound = new EventEmitter<{ configUrl: string[] }>();

export function onInit(connection: Connection) {
    connection.onInitialize((params: InitializeParams) => {
        return initialize(params);
    });

    connection.onInitialized(() => {
        if (serverConfig.configuration) {
            // Register for all configuration changes.
            connection.client.register(
                DidChangeConfigurationNotification.type,
                undefined
            );
        }
        if (serverConfig.workspaceFolder) {
            connection.workspace.onDidChangeWorkspaceFolders((_event) => {
                connection.console.log(
                    'Workspace folder change event received.'
                );
            });
        }
    });
}

function initialize(params: InitializeParams) {
    let capabilities = params.capabilities;

    if (!params.workspaceFolders) {
        throw new Error('Extension not given access to workspace folders.');
    }

    params.workspaceFolders?.forEach((folder) => {
        const fsPath = URI.parse(folder.uri).fsPath;

        const sasqlConfig = join(fsPath, 'sasqlconfig.json');

        if (!existsSync(sasqlConfig)) {
            throw new Error(
                'You must have an sasqlconfig.json at the root of your workspace.'
            );
        }

        console.log(sasqlConfig);

        const config = readProjectConfig(sasqlConfig);
        const files = resolveProjectFiles(fsPath, config);

        files.forEach((file) => {
            console.log(file);
        });

        configFound.emit('configUrl', sasqlConfig);
        configLocation = sasqlConfig;
    });

    // Does the client support the `workspace/configuration` request?
    // If not, we fall back using global settings.
    serverConfig.configuration = !!(
        capabilities.workspace && !!capabilities.workspace.configuration
    );
    serverConfig.workspaceFolder = !!(
        capabilities.workspace && !!capabilities.workspace.workspaceFolders
    );
    serverConfig.diagnosticRelatedInfo = !!(
        capabilities.textDocument &&
        capabilities.textDocument.publishDiagnostics &&
        capabilities.textDocument.publishDiagnostics.relatedInformation
    );

    const result: InitializeResult = {
        capabilities: {
            textDocumentSync: TextDocumentSyncKind.Full,
            completionProvider: {
                resolveProvider: true
            }
        }
    };

    result.capabilities.workspace = {
        workspaceFolders: { supported: true }
    };

    return result;
}
