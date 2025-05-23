import * as vscode from 'vscode';

export function registerDirectiveCompletionProvider() {
    vscode.languages.registerCompletionItemProvider(
        { language: 'sasql' },
        {
            provideCompletionItems(document, position, token, context) {
                const completionItems: vscode.CompletionItem[] = [];

                ['use', 'include'].forEach((directive) => {
                    const suggestion = new vscode.CompletionItem(
                        directive,
                        vscode.CompletionItemKind.Keyword
                    );
                    suggestion.insertText = new vscode.SnippetString(directive);
                    completionItems.push(suggestion);
                });

                return completionItems;
            }
        },
        '@'
    );
}
