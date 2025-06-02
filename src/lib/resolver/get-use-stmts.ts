import { dirname, join } from 'path';
import { sys } from '../sys.js';

export const useRegex = /@use '([.\/a-z_-]+)' as ([a-z_-]+);/g;

export function getUseStmts(source: string, fsPath: string) {
    const matches = matchAllUseStmts(source);

    const errors: unknown[] = [];

    const parsed = matches.flatMap((m) => {
        try {
            let [stmt, path, alias] = m;

            if (!stmt) {
                // this should never hit
                throw new Error('Expected import stmt, received undefined.');
            }

            if (!path) {
                // @todo - diagnostic message
                throw new Error('Expected path, received undefined.');
            }

            if (!path.endsWith('.sasql')) {
                path = path + '.sasql';
            }

            if (!alias) {
                // @todo - diagnostic message
                throw new Error('Expected alias, received undefined.');
            }

            // If this is not an absolute path, resolve it relative to the source
            if (!sys.fileExists(path)) {
                let resolvedPath = join(dirname(fsPath), path);
                if (!sys.fileExists(resolvedPath)) {
                    throw new Error(
                        `Failed to resolve import at ` + resolvedPath
                    );
                }
                path = resolvedPath;
            }

            return [{ path, alias }];
        } catch (e) {
            errors.push(e);
            return [];
        }
    });

    return {
        stmts: parsed,
        errors
    };
}

export function matchAllUseStmts(source: string) {
    const matches: RegExpExecArray[] = [];

    const all = source.matchAll(useRegex);

    while (true) {
        let nextMatch = all.next();
        if (nextMatch.done) {
            return matches;
        }
        matches.push(nextMatch.value);
    }
}
