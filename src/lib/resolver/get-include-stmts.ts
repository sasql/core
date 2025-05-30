import { matchAll } from './match-all.js';

export const includeLocalText = '((?<!@)@include)\\s+([a-zA-Z0-9_\\-]+)(;)';
export const includeLocalRegex = new RegExp(includeLocalText, 'g');

export const includeImportText =
    '((?<!@)@include)\\s+([a-zA-Z0-9_\\-]+)(\\.)([a-zA-Z0-9_\\-]+)(;)';
export const includeImportRegex = new RegExp(includeImportText, 'g');

export function getIncludeStmts(source: string) {
    const localMatches = matchAll(source, includeLocalRegex);
    const includeMatches = matchAll(source, includeImportRegex);

    console.log(localMatches);
    console.log(includeMatches);

    // return {
    //     local: localMatches.map(local => {}),
    //     imported: includeMatches.map(imported => {
    //         const []
    //     })
    // }
}
