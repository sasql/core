import { serverConfig } from '../handlers/init.js';
import { Connection } from '../server.js';

export function registerConfigurationEventHandlers(
    connection: Connection,
    documentSettings: Map<string, Thenable<any>>
) {
    connection.onDidChangeConfiguration((change) => {
        if (serverConfig.configuration) {
            documentSettings.clear();
        }

        if (change.settings.languageServerExample) {
            // @todo
        }
    });
}
