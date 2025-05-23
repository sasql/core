"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLanguageServer = createLanguageServer;
const path_1 = require("path");
const vscode_1 = require("vscode");
const node_1 = require("vscode-languageclient/node");
function createLanguageServer(context) {
    const serverModule = (0, path_1.join)(context.asAbsolutePath('server'), 'dist', 'server.js');
    const debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };
    const serverOptions = {
        run: { module: serverModule, transport: node_1.TransportKind.ipc },
        debug: {
            module: serverModule,
            transport: node_1.TransportKind.ipc,
            options: debugOptions
        }
    };
    const clientOptions = {
        documentSelector: [{ scheme: 'file', language: 'sasql' }],
        synchronize: {
            fileEvents: vscode_1.workspace.createFileSystemWatcher('**/.clientrc')
        }
    };
    const client = new node_1.LanguageClient('sasql-server', 'SASQL Server', serverOptions, clientOptions);
    return client;
}
//# sourceMappingURL=create-language-server.js.map