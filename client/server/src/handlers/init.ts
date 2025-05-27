import {
    DidChangeConfigurationNotification,
    InitializeParams,
    InitializeResult,
    TextDocumentSyncKind
} from 'vscode-languageserver';
import { Connection } from '../server.js';

export const serverConfig = {
    configuration: false,
    workspaceFolder: true,
    diagnosticRelatedInfo: false
};

export function registerInitEvents(
    connection: Connection,
    resolveWorkspace: (params: InitializeParams) => void
) {
    connection.onInitialize((params) => {
        resolveWorkspace(params);
        return initialize(params);
    });

    connection.onInitialized(() => {
        onInitialized(connection);
    });
}

export function initialize(params: InitializeParams) {
    let capabilities = params.capabilities;

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

export function onInitialized(connection: Connection) {
    if (serverConfig.configuration) {
        // Register for all configuration changes.
        connection.client.register(
            DidChangeConfigurationNotification.type,
            undefined
        );
    }
    if (serverConfig.workspaceFolder) {
        connection.workspace.onDidChangeWorkspaceFolders((_event) => {
            connection.console.log('Workspace folder change event received.');
        });
    }
}
