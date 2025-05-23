import { join } from 'path';
import { ExtensionContext, workspace } from 'vscode';
import {
    LanguageClient,
    LanguageClientOptions,
    ServerOptions,
    TransportKind
} from 'vscode-languageclient/node';

export function createLanguageServer(context: ExtensionContext) {
    const serverModule = join(
        context.asAbsolutePath('server'),
        'dist',
        'server.js'
    );

    const debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };

    const serverOptions: ServerOptions = {
        run: { module: serverModule, transport: TransportKind.ipc },
        debug: {
            module: serverModule,
            transport: TransportKind.ipc,
            options: debugOptions
        }
    };

    const clientOptions: LanguageClientOptions = {
        documentSelector: [{ scheme: 'file', language: 'sasql' }],
        synchronize: {
            fileEvents: workspace.createFileSystemWatcher('**/.clientrc')
        }
    };

    const client = new LanguageClient(
        'sasql-server',
        'SASQL Server',
        serverOptions,
        clientOptions
    );

    return client;
}
