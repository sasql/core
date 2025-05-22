import { watch } from 'chokidar';
import { resolve } from 'path';

const watchDirectory = (dirPath) => {
    const watcher = watch(dirPath, {
        persistent: true,
        ignoreInitial: true, // Don't fire events for existing files
        depth: undefined // Watch all subdirectories
    });

    watcher
        .on('add', (path) => console.log(`File added: ${path}`))
        .on('change', (path) => console.log(`File changed: ${path}`))
        .on('unlink', (path) => console.log(`File deleted: ${path}`))
        .on('addDir', (path) => console.log(`Directory added: ${path}`))
        .on('unlinkDir', (path) => console.log(`Directory deleted: ${path}`))
        .on('error', (error) => console.error(`Watcher error: ${error}`))
        .on('ready', () =>
            console.log('Initial scan complete. Ready for changes')
        );

    // For moves/renames, you can track by comparing events
    let recentlyDeleted = new Map();

    watcher.on('unlink', (path) => {
        recentlyDeleted.set(path, Date.now());
        setTimeout(() => recentlyDeleted.delete(path), 100); // Clean up after 100ms
    });

    watcher.on('add', (path) => {
        // Check if this might be a rename/move
        const now = Date.now();
        for (const [deletedPath, deleteTime] of recentlyDeleted) {
            if (now - deleteTime < 100) {
                // Within 100ms window
                console.log(`File moved/renamed: ${deletedPath} -> ${path}`);
                recentlyDeleted.delete(deletedPath);
                return;
            }
        }
        console.log(`File added: ${path}`);
    });

    return watcher;
};

// Usage
const watcher = watchDirectory(resolve());
