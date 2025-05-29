import { TextDocument } from 'vscode-languageserver-textdocument';
import { TextDocuments } from 'vscode-languageserver';
import { Compiler, SasqlConfig } from '@sasql/core';

import { compileSasqlProgram } from '../document-handlers/compile-program.js';

export const compilers = new Map<string, Compiler>();
export const config: SasqlConfig | null = null;

export function registerDocumentEventHandlers() {
    const documentSettings: Map<string, Thenable<any>> = new Map();
    const documents: TextDocuments<TextDocument> = new TextDocuments(
        TextDocument
    );

    documents.onDidChangeContent(({ document }) => {
        try {
            compileSasqlProgram(document);
        } catch (e) {
            console.error(e);
        }
    });

    // documents.onDidClose(({ document }) => {
    ////     @todo
    // });

    return { documents, documentSettings };
}
