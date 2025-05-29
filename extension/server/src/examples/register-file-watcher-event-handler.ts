import { Connection } from '../server.js';

export function registerFileWatcherEventHandler(connection: Connection) {
    connection.onDidChangeWatchedFiles((_change) => {
        connection.console.log('We received a file change event');
    });
}
