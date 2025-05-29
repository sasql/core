import { statSync } from 'fs';
import ts from 'typescript';

export namespace sys {
    export const readFile = ts.sys.readFile;
    export const fileExists = ts.sys.fileExists;
    export const watchDir = ts.sys.watchDirectory;
    export const watchFile = ts.sys.watchFile;
    export const createDirectory = ts.sys.createDirectory;
    export const writeFile = ts.sys.writeFile;
    export const resolvePath = ts.sys.resolvePath;
    export const isDirectory = (path: string) => statSync(path).isDirectory();
    export const isNotDirectory = (path: string) => !isDirectory(path);
}
