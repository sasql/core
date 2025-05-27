export { createCompilerProgram } from './compiler/compiler.js';

export {
    DiagnosticCategory,
    DiagnosticMessage
} from './compiler/diagnostic-message.js';

export { parse } from './compiler/parser.js';
export { sys } from './compiler/sys.js';
export { type TokinizationResult, tokenize } from './compiler/tokenizer.js';
export type {
    CommentBlock,
    DocTag,
    IncludeDirective,
    ParseResult,
    Position,
    StatementDirective,
    Token,
    TokenType,
    UseDirective,
    Compiler,
    CompilerProgram,
    CompilerProgramOptions
} from './compiler/types.js';
export { isIncludeDirectiveV2 } from './compiler/types.js';
export { type Resolver, createResolver } from './compiler/resolver.js';
export {
    type SasqlConfig,
    findProjectConfig,
    readProjectConfig,
    resolveProjectFiles
} from './compiler/config.js';
