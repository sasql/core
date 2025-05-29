import { comment } from './comment.js';
import { regexps } from './regexps.js';
import { string } from './string.js';

export const repository = {
    ...comment,
    ...regexps,
    ...string
};
