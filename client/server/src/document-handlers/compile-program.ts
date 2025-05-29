import { URI } from 'vscode-uri';
import { compilerProgram, connection } from '../server.js';
import { Diagnostic } from 'vscode-languageserver';
import { DiagnosticMessage } from '@sasql/core';
import { TextDocument } from 'vscode-languageserver-textdocument';

let compiledProgram = false;

export function compileSasqlProgram(document?: TextDocument) {
    if (!compilerProgram) {
        return;
    }

    if (!compiledProgram) {
        compiledProgram = true;

        const { diagnosticMessages, unknownExceptions } =
            compilerProgram.compileProject();

        sendDiagnostics(unknownExceptions, diagnosticMessages);
        return;
    }

    if (!document) {
        return;
    }

    const path = uriToFilePath(document.uri);

    if (!compilerProgram.compilers.has(path)) {
        return;
    }

    const compiler = compilerProgram.compilers.get(path)!;
    const { diagnosticMessages, unknownExceptions, recompiled } =
        compiler.recompile(document.getText());

    Object.entries(recompiled).forEach(
        ([fsPath, { diagnosticMessages, unknownExceptions }]) => {
            if (diagnosticMessages.length === 0) {
                connection.sendDiagnostics({
                    uri: uriToFilePath(fsPath),
                    diagnostics: []
                });
            } else {
                sendDiagnostics(unknownExceptions, diagnosticMessages);
            }
        }
    );

    if (diagnosticMessages.length === 0) {
        connection.sendDiagnostics({
            uri: uriToFilePath(path),
            diagnostics: []
        });
    } else {
        sendDiagnostics(unknownExceptions, diagnosticMessages);
    }
}

function sendDiagnostics(
    unknownExceptions: unknown[],
    diagnosticMessages: DiagnosticMessage[]
) {
    unknownExceptions.forEach((exception) => {
        console.error(exception);
    });

    const messageMap: {
        [srcPath: string]: Diagnostic[];
    } = {};

    diagnosticMessages.forEach((message) => {
        const uri = URI.file(message.srcPath).toString();
        messageMap[uri] ??= [];
        messageMap[uri].push({
            message: message.message,
            range: message.range,
            severity: message.category,
            source: 'sasql'
        });
    });

    Object.entries(messageMap).forEach(([uri, diagnostics]) => {
        connection.sendDiagnostics({
            uri,
            diagnostics
        });
    });
}

export function uriToFilePath(uri: string) {
    return URI.parse(uri).fsPath;
}

export function filePathToUri(fsPath: string) {
    return URI.file(fsPath).toString();
}
