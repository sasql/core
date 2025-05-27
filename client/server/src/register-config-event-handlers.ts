import { serverConfig } from './register-init-event-handlers.js';
import { Connection } from './server.js';
import { Settings } from './types.js';

export function registerConfigEventHandlers(
    connection: Connection,
    documentSettings: Map<string, Thenable<any>>,
    globalSettings: Settings,
    defaultSettings: Settings
) {
    connection.onDidChangeConfiguration((change) => {
        if (serverConfig.configuration) {
            // Reset all cached document settings
            documentSettings.clear();
        } else {
            globalSettings = <Settings>(
                (change.settings.languageServerExample || defaultSettings)
            );
        }
    });
}
