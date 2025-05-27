import { TextDocument } from 'vscode-languageserver-textdocument';
import { TextDocuments } from 'vscode-languageserver';

import { validateTextDocument } from './document-handlers/validate.js';
import { Compiler, SasqlConfig } from '@sasql/core';
import { URI } from 'vscode-uri';

export const compilers = new Map<string, Compiler>();
export const config: SasqlConfig | null = null;

export function registerDocumentEventHandlers() {
    const documentSettings: Map<string, Thenable<any>> = new Map();

    /** Manages text documents */
    const documents: TextDocuments<TextDocument> = new TextDocuments(
        TextDocument
    );

    documents.onDidChangeContent(({ document }) => {
        const path = uriToFilePath(document.uri);

        try {
            const compiler = compilers.get(path);
            validateTextDocument(document, compiler);
        } catch (e) {
            console.error(e);
        }
    });

    documents.onDidClose((e) => {
        documentSettings.delete(e.document.uri);
        compilers.delete(uriToFilePath(e.document.uri));
    });

    return {
        documentSettings,
        documents
    };
}

export function uriToFilePath(uri: string) {
    return URI.parse(uri).fsPath;
}
