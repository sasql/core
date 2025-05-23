import * as vscode from 'vscode';

import { dirname, join } from 'path';
import { readdirSync, statSync } from 'fs';

export function registerPathCompletionProvider() {
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
}
