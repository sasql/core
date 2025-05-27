import { Connection } from './server.js';
import {
    CompletionItemKind,
    TextDocumentPositionParams,
    CompletionItem
} from 'vscode-languageserver';

export function registerCompletionEventHandlers(connection: Connection) {
    // Provides the initial list of the completion items.
    connection.onCompletion(
        (
            _textDocumentPosition: TextDocumentPositionParams
        ): CompletionItem[] => {
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
}
