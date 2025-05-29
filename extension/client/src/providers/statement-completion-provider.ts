import * as vscode from 'vscode';
import * as sasql from '../sys/parser';

export function registerStatementCompletionProvider() {
    vscode.languages.registerCompletionItemProvider(
        { language: 'sasql' },
        {
            provideCompletionItems(
                document: vscode.TextDocument,
                position: vscode.Position,
                token: vscode.CancellationToken,
                context: vscode.CompletionContext
            ) {
                const completionItems: vscode.CompletionItem[] = [];

                const { imports } = parseSasqlDocument(document);

                Object.values(imports).forEach((imported) => {
                    try {
                        const importSuggestion = new vscode.CompletionItem(
                            imported.alias,
                            vscode.CompletionItemKind.Function
                        );
                        importSuggestion.insertText = new vscode.SnippetString(
                            imported.alias
                        );

                        const commentBlock = imported.sourceFile.comments[0];
                        const commentText = commentBlock?.text;

                        if (commentText) {
                            console.log(commentText);
                            importSuggestion.documentation =
                                new vscode.MarkdownString(commentText);
                        }

                        completionItems.push(importSuggestion);
                    } catch (e) {
                        console.error(e);
                    }
                });

                return completionItems;
            }
        }
    );
}

function parseSasqlDocument(document: vscode.TextDocument) {
    try {
        const activePath = document.uri.fsPath;
        const text = document.getText();
        return sasql.parseSourceFile(text, activePath);
    } catch (e) {
        console.error(e);
        throw e;
    }
}
