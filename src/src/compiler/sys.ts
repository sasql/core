import ts from 'typescript';

export namespace sys {
    export const readFile = ts.sys.readFile;
    export const fileExists = ts.sys.fileExists;
    export const watchDir = ts.sys.watchDirectory;
    export const watchFile = ts.sys.watchFile;
    export const createDirectory = ts.sys.createDirectory;
    export const writeFile = ts.sys.writeFile;
    export const resolvePath = ts.sys.resolvePath;
}
