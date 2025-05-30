import {
    CompletionItemKind,
    TextDocumentPositionParams,
    CompletionItem
} from 'vscode-languageserver/node.js';
import { compilerProgram, type Connection } from '../server.js';
import { uriToFilePath } from '../document-handlers/compile-program.js';
import { Compiler } from '@sasql/core';
import { StatementDirective } from '../../../../dist/lib/types.js';

const includeCompletion = /(@include)\s+([a-z_-]+)\./;

export function registerCompletionEventHandlers(connection: Connection) {
    // Provides the initial list of the completion items.
    connection.onCompletion(
        ({
            position,
            textDocument
        }: TextDocumentPositionParams): CompletionItem[] => {
            if (!compilerProgram) {
                console.error('Compiler program not initialized.');
                return [];
            }

            const docCompiler = compilerProgram.compilers.get(
                uriToFilePath(textDocument.uri)
            );

            if (!docCompiler) {
                console.error('Document not found.');
                return [];
            }

            // console.log(docCompiler.positions);

            const ln = docCompiler.source.split(/\n/g)[position.line];

            const triggerCharacter = ln.substring(
                position.character - 1,
                position.character
            );

            if (triggerCharacter === '@') {
                return [
                    {
                        label: 'Use directive',
                        insertText: 'use',
                        kind: CompletionItemKind.Keyword
                    },
                    {
                        label: 'Include directive',
                        insertText: 'include',
                        kind: CompletionItemKind.Keyword
                    },
                    {
                        label: 'Statement directive',
                        insertText: 'statement',
                        kind: CompletionItemKind.Keyword
                    }
                ];
            }

            // const before = ln.substring(0, position.character).trim();
            // const after = ln.substring(position.character).trim();

            // console.log('before', before);
            // console.log('after', after);

            if (ln.includes(`@use .`)) {
            }

            if (ln.includes('@include')) {
                return completeInclude(ln, docCompiler);
            }

            return [
                ...getCompletionItemsForStmts(docCompiler),
                ...Object.keys(docCompiler.imports).map(
                    (alias): CompletionItem => {
                        return {
                            label: alias,
                            insertText: alias
                        };
                    }
                )
            ];
        }
    );

    // Resolves additional information for the item selected in the completion list.
    connection.onCompletionResolve((item: CompletionItem): CompletionItem => {
        return item;
    });
}

function completeInclude(ln: string, docCompiler: Compiler) {
    const matchResult = ln.match(includeCompletion) ?? [];

    const alias = matchResult[2];
    if (!alias) {
        return [];
    }

    const imported = docCompiler.imports[alias];
    if (!imported) {
        return [];
    }

    return [
        ...getCompletionItemsForStmts(imported),
        ...getCompletionItemsForStmts(docCompiler)
    ];
}

function getCompletionItemsForStmts(compiler: Compiler) {
    return Object.values(compiler.statements).map((stmt): CompletionItem => {
        return {
            label: stmt.stmtName.text,
            documentation: parseDescription(stmt),
            insertText: stmt.stmtName.text + ';',
            kind: CompletionItemKind.Field
        };
    });
}

export function parseDescription(stmt: StatementDirective) {
    if (!stmt.commentBlock) {
        return undefined;
    }

    let description = '';

    const words = [...stmt.commentBlock.description];

    while (true) {
        let nextWord = words.shift()?.text;

        if (!nextWord) {
            return description;
        }

        if (/[.?!,_-]/.test(nextWord)) {
            description += nextWord;
            continue;
        }

        description += ' ' + nextWord;
    }
}

// @ts-ignore
function completePath(compiler: Compiler): CompletionItem[] {
    return [];
}
