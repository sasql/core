export const useRegex = /@use '([.\/a-z_-]+)' as ([a-z_-]+);/g;

export function getUseStmts(source: string) {
    const matches = matchAllUseStmts(source);

    return matches.map((m) => {
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

        return { path, alias };
    });
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
