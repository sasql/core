import * as vscode from 'vscode';
import * as sasql from './sys/parser';
import { dirname, join, resolve } from 'path';
import { fstatSync, readdirSync, statSync } from 'fs';
import { globSync } from 'glob';

// Called when extension is activated
export function activate(context: vscode.ExtensionContext) {
    console.log('SASQL extension activated.');

    // Example command
    const disposable = vscode.commands.registerCommand(
        'sasql.helloWorld',
        () => {}
    );

    // vscode.languages.registerHoverProvider(
    //     { language: 'sasql' },
    //     {
    //         provideHover(document, position, token) {
    //             const hoverItems: vscode.Hover = {
    //                 contents: ''
    //             };

    //             return hoverItems;
    //         }
    //     }
    // );

    vscode.languages.registerCompletionItemProvider(
        {
            language: 'sasql'
        },
        {
            provideCompletionItems(document, range) {
                const completionItems: vscode.CompletionItem[] = [];

                const line = document.lineAt(range.line);
                const lineStart = line.text.substring(0, range.character);

                const pathStart = lineStart.match(/["'][.\/a-z_-]*$/);

                const matches = Array.from(pathStart ?? []);
                if (matches.length === 0) {
                    return;
                }

                const relativePath = matches[0].substring(1, matches[0].length);
                const fileDirectory = dirname(document.uri.fsPath);

                readdirSync(join(fileDirectory, relativePath)).forEach((p) => {
                    if (statSync(join(fileDirectory, p)).isDirectory()) {
                        completionItems.push({
                            kind: vscode.CompletionItemKind.Folder,
                            label: join(fileDirectory, p)
                        });
                    } else if (p.endsWith('.sasql')) {
                        completionItems.push({
                            kind: vscode.CompletionItemKind.File,
                            label: join(fileDirectory, p)
                        });
                    }
                });

                return completionItems;
            }
        },
        '/'
    );

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

    context.subscriptions.push(disposable);
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

// This method is called when your extension is deactivated
export function deactivate() {}
