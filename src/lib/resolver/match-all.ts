export function matchAll(text: string, regExp: RegExp) {
    const matches: RegExpExecArray[] = [];

    const all = text.matchAll(regExp);

    while (true) {
        let nextMatch = all.next();
        if (nextMatch.done) {
            return matches;
        }
        matches.push(nextMatch.value);
    }
}
