import { SourceFile } from './types';
import { tokenize } from './tokenizer';
import { parseDirectives } from './directive-parser';

export function parseSourceFile(text: string, srcPath: string): SourceFile {
    try {
        const { directives, comments } = tokenize(text);
        return parseDirectives(text, srcPath, directives, comments);
    } catch (e) {
        console.error(e);
        throw e;
    }
}
