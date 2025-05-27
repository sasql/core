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
        console.error('THIS PATH DOES NOT EXIST, DANGIT');
        return;
    }

    const compiler = compilerProgram.compilers.get(path)!;
    const { diagnosticMessages, unknownExceptions } = compiler.recompile(
        document.getText()
    );

    console.log(
        diagnosticMessages.map((m) => m.range),
        unknownExceptions
    );

    if (diagnosticMessages.length === 0) {
        console.log(URI.file(path).toString());
        connection.sendDiagnostics({
            uri: URI.file(path).toString(),
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
