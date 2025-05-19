import { ChunkType, SourceFile, TextChunk, Token, TokenType } from './types.js';
import { tokenize } from './tokenizer.js';
import ts from 'typescript';
import {
    parseIncludeDirective,
    parseStatementDirective,
    parseUseDirective
} from './parser/directive-parser.js';
import { parseCommentBlock } from './parser/doc-parser.js';

export function parseSourceFile(
    text: string,
    srcPath: string,
    readFile = ts.sys.readFile
): SourceFile {
    let tokens: Token[];

    const sourceFile: SourceFile = {
        text,
        srcPath,
        imports: {},
        chunks: [],
        diagnosticMessages: [],
        statements: {}
    };

    try {
        tokens = tokenize(text);
    } catch (e) {
        sourceFile.diagnosticMessages.push(<any>e);
        return sourceFile;
    }

    while (true) {
        let token = tokens.shift();
        if (!token) return sourceFile;

        switch (token.type) {
            case TokenType.COMMENT:
                break;
            case TokenType.COMMENT_BLOCK:
                const { commentBlock, diagnosticMessages } =
                    parseCommentBlock(token);
                sourceFile.chunks.push(commentBlock);
                sourceFile.diagnosticMessages.push(...diagnosticMessages);
                break;
            case TokenType.DIRECTIVE:
                parseDirective(token);
                break;
            default:
                sourceFile.chunks.push(<TextChunk>{
                    type: ChunkType.TEXT_CHUNK,
                    startIndex: token.startIndex,
                    endIndex: token.endIndex,
                    text: token.text
                });
        }
    }

    function parseDirective(token: Token) {
        if (token.text.startsWith('@use')) {
            try {
                const use = parseUseDirective(srcPath, token, readFile);
                sourceFile.imports[use.alias] = use;
            } catch (e) {
                sourceFile.diagnosticMessages.push(<any>e);
            }

            return;
        }

        if (token.text.startsWith('@include')) {
            try {
                const include = parseIncludeDirective(
                    token,
                    sourceFile.imports
                );
                sourceFile.chunks.push(include);
            } catch (e) {
                sourceFile.diagnosticMessages.push(<any>e);
            }

            return;
        }

        if (token.text.startsWith('@statement')) {
            try {
                const statement = parseStatementDirective(token);
                sourceFile.statements[statement.name] = statement;
            } catch (e) {
                sourceFile.diagnosticMessages.push(<any>e);
            }
        }
    }
}
