import * as vscode from 'vscode';
import { LanguageClient } from 'vscode-languageclient/node';

import { createLanguageServer } from './create-language-server';

let client: LanguageClient;

// Called when extension is activated
export function activate(context: vscode.ExtensionContext) {
    // registerStatementCompletionProvider();
    // registerDirectiveCompletionProvider();
    // registerPathCompletionProvider();

    client = createLanguageServer(context);
    client.start();

    context.subscriptions.push(
        vscode.commands.registerCommand('sasql.reloadLanguageServer', () => {
            client.restart();
        })
    );
}

// This method is called when your extension is deactivated
export function deactivate() {
    if (!client) {
        return undefined;
    }
    return client.stop();
}
