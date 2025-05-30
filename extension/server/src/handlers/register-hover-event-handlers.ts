import { HandlerResult, Hover } from 'vscode-languageserver/node.js';
import { compilerProgram, Connection } from '../server.js';
import { uriToFilePath } from '../document-handlers/compile-program.js';
import { isIncludeDirective } from '../../../../dist/lib/types.js';
import { parseDescription } from './register-completion-event-handlers.js';

export function registerHoverEventHandlers(connection: Connection) {
    connection.onHover(
        ({
            position,
            textDocument
        }): HandlerResult<Hover | null | undefined, void> => {
            console.log('hovered');

            if (!compilerProgram) {
                return;
            }

            const docCompiler = compilerProgram.compilers.get(
                uriToFilePath(textDocument.uri)
            );

            if (!docCompiler) {
                return;
            }

            const token = docCompiler.positions.getAtPosn(
                position.line,
                position.character
            );

            if (isIncludeDirective(token)) {
                if (token.module) {
                    const imported = docCompiler.imports[token.module.text];
                    if (!imported) {
                        return;
                    }
                    const statement = imported.statements[token.import.text];
                    if (!statement) {
                        return;
                    }

                    return {
                        contents: parseDescription(statement) ?? ''
                    };
                }
            }

            return;
        }
    );
}
