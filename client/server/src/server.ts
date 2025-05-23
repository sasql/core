import {
    createConnection,
    TextDocuments,
    ProposedFeatures,
    CompletionItem,
    CompletionItemKind,
    TextDocumentPositionParams
} from 'vscode-languageserver/node.js';

import { TextDocument } from 'vscode-languageserver-textdocument';
import {
    hasConfigurationCapability,
    onInitialize,
    onInitialized
} from './on-initialize.js';
import { validateTextDocument } from './validate.js';

export const connection = createConnection(ProposedFeatures.all);

export declare type Connection = typeof connection;

connection.onInitialize(onInitialize);
connection.onInitialized(() => onInitialized());

// The example settings
export interface ExampleSettings {
    maxNumberOfProblems: number;
}

// The global settings, used when the `workspace/configuration` request is not supported by the client.
// Please note that this is not the case when using this server with the client provided in this example
// but could happen with other clients.
export const defaultSettings: ExampleSettings = { maxNumberOfProblems: 1000 };
export let globalSettings: ExampleSettings = defaultSettings;

//
// Document
//

export const documentSettings: Map<
    string,
    Thenable<ExampleSettings>
> = new Map();

/** Manages text documents */
let documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

// Delete settings for closed documents
documents.onDidClose((e) => {
    documentSettings.delete(e.document.uri);
});

// The content of a text document has changed.
// Emits when the text document first opened or when its content changes
documents.onDidChangeContent((change) => {
    console.log(change);
});

//
// Connection Events
//

connection.onDidChangeConfiguration((change) => {
    if (hasConfigurationCapability) {
        // Reset all cached document settings
        documentSettings.clear();
    } else {
        globalSettings = <ExampleSettings>(
            (change.settings.languageServerExample || defaultSettings)
        );
    }

    // Revalidate all open text documents
    documents.all().forEach(validateTextDocument);
});

// Monitored files have change in VS Code
connection.onDidChangeWatchedFiles((_change) => {
    connection.console.log('We received a file change event');
});

// Provides the initial list of the completion items.
connection.onCompletion(
    (_textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
        console.log('Completion requested');
        // The pass parameter contains the position of the text document in
        // which code complete got requested. For the example we ignore this
        // info and always provide the same completion items.
        return [
            {
                label: 'TypeScript',
                kind: CompletionItemKind.Text,
                data: 1
            },
            {
                label: 'JavaScript',
                kind: CompletionItemKind.Text,
                data: 2
            }
        ];
    }
);

// Resolves additional information for the item selected in the completion list.
connection.onCompletionResolve((item: CompletionItem): CompletionItem => {
    if (item.data === 1) {
        item.detail = 'TypeScript details';
        item.documentation = 'TypeScript documentation';
    } else if (item.data === 2) {
        item.detail = 'JavaScript details';
        item.documentation = 'JavaScript documentation';
    }
    return item;
});

// Listen on the connection for open, change and close text document events
documents.listen(connection);

connection.listen();
