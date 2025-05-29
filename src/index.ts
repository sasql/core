export { createCompilerProgram } from './lib/compiler.js';

export {
    DiagnosticCategory,
    DiagnosticMessage
} from './lib/diagnostic-message.js';

export { parse } from './lib/parser.js';
export { sys } from './lib/sys.js';
export { type TokinizationResult, tokenize } from './lib/tokenizer.js';
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
} from './lib/types.js';
export { isIncludeDirectiveV2 } from './lib/types.js';
export { type Resolver, createResolver } from './lib/resolver.js';
export {
    type SasqlConfig,
    findProjectConfig,
    readProjectConfig,
    resolveProjectFiles
} from './lib/config.js';
