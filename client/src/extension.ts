import * as vscode from 'vscode';
import { LanguageClient } from 'vscode-languageclient/node';

import { registerStatementCompletionProvider } from './providers/statement-completion-provider';
import { registerDirectiveCompletionProvider } from './providers/suggest-directive-names';
import { registerPathCompletionProvider } from './providers/path-completion-provider';
import { createLanguageServer } from './create-language-server';

let client: LanguageClient;

// Called when extension is activated
export function activate(context: vscode.ExtensionContext) {
    console.log('SASQL extension activated.');

    // Example command
    const disposable = vscode.commands.registerCommand(
        'sasql.helloWorld',
        () => {}
    );

    registerStatementCompletionProvider();
    registerDirectiveCompletionProvider();
    registerPathCompletionProvider();

    client = createLanguageServer(context);
    client.start();

    context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {
    if (!client) {
        return undefined;
    }
    return client.stop();
}
