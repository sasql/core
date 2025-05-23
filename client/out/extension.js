"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const statement_completion_provider_1 = require("./providers/statement-completion-provider");
const suggest_directive_names_1 = require("./providers/suggest-directive-names");
const path_completion_provider_1 = require("./providers/path-completion-provider");
const create_language_server_1 = require("./create-language-server");
let client;
// Called when extension is activated
function activate(context) {
    console.log('SASQL extension activated.');
    // Example command
    const disposable = vscode.commands.registerCommand('sasql.helloWorld', () => { });
    (0, statement_completion_provider_1.registerStatementCompletionProvider)();
    (0, suggest_directive_names_1.registerDirectiveCompletionProvider)();
    (0, path_completion_provider_1.registerPathCompletionProvider)();
    client = (0, create_language_server_1.createLanguageServer)(context);
    client.start();
    context.subscriptions.push(disposable);
}
// This method is called when your extension is deactivated
function deactivate() {
    if (!client) {
        return undefined;
    }
    return client.stop();
}
//# sourceMappingURL=extension.js.map