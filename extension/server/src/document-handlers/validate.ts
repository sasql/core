// import { Compiler, createCompilerProgram } from '@sasql/core';
// import { Diagnostic } from 'vscode-languageserver';
// import { TextDocument } from 'vscode-languageserver-textdocument';
// import { URI } from 'vscode-uri';

// import { connection } from '../server.js';

// export async function validateTextDocument(
//     textDocument: TextDocument,
//     compiler?: Compiler
// ): Promise<void> {
//     const rootPath = URI.parse(textDocument.uri).fsPath;

//     if (!compiler) {
//         const { compilers } = createCompilerProgram(rootPath, {
//             ignoreWhitespace: true,
//             removeComments: true
//         });
//         compilers.set(rootPath, compiler);
//     } else {
//         compileDependents(compiler);
//     }

//     // Send the computed diagnostics to VS Code.
// }

// function compileDependents(compiler: Compiler) {
//     compile(compiler, false);

//     if (compiler.dependants) {
//         compiler.dependants.forEach((compiler) => {
//             compileDependents(compiler);
//         });
//     }
// }

// function compile(compiler: Compiler, compileDependents: boolean) {
//     const results = compiler.compile(compileDependents);

//     let diagnostics: Diagnostic[] = [];
//     let problems = 0;

//     results.diagnosticMessages.forEach((message) => {
//         problems++;
//         console.log(message);
//         diagnostics.push({
//             message: message.message,
//             range: message.range,
//             severity: message.category,
//             source: 'sasql'
//         });
//     });

//     connection.sendDiagnostics({
//         uri: URI.file(compiler.srcPath).toString(),
//         diagnostics
//     });
// }
