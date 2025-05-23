import { DiagnosticMessage } from './diagnostic-message.js';
import { ChunkType, Output, SourceFile, SourceMapEntry } from './types.js';

export function compile(srcFile: SourceFile): Output {
    const sourceMap: SourceMapEntry[] = [];
    const diagnosticMessages: DiagnosticMessage[] = [
        ...srcFile.diagnosticMessages
    ];

    let toEmit = '';
    srcFile.chunks.forEach((chunk) => {
        const mapStart = toEmit.length;

        switch (chunk.type) {
            case ChunkType.TEXT_CHUNK:
                toEmit += chunk.text;
                sourceMap.push({
                    local: {
                        path: srcFile.srcPath,
                        startIndex: mapStart,
                        endIndex: toEmit.length
                    },
                    remote: {
                        path: srcFile.srcPath,
                        startIndex: chunk.startIndex,
                        endIndex: chunk.endIndex
                    }
                });
                break;
            case ChunkType.INCLUDE_DIRECTIVE:
                // @todo - optimize this
                // @todo - we need to compile imports, right?
                // @todo - what happens if a statement has an @include?
                const compiled =
                    chunk.include.statements[chunk.import].statement;
                toEmit += compiled;
                diagnosticMessages.push(...chunk.include.diagnosticMessages);
                sourceMap.push({
                    local: {
                        path: srcFile.srcPath,
                        startIndex: mapStart,
                        endIndex: toEmit.length
                    },
                    remote: {
                        path: srcFile.srcPath,
                        startIndex: chunk.startIndex,
                        endIndex: chunk.endIndex
                    }
                });
                break;
        }
    });

    return {
        emit: toEmit,
        source: srcFile,
        sourceMap: sourceMap,
        diagnostics: diagnosticMessages
    };
}
