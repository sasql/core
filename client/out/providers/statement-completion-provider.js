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
exports.registerStatementCompletionProvider = registerStatementCompletionProvider;
const vscode = __importStar(require("vscode"));
const sasql = __importStar(require("../sys/parser"));
function registerStatementCompletionProvider() {
    vscode.languages.registerCompletionItemProvider({ language: 'sasql' }, {
        provideCompletionItems(document, position, token, context) {
            const completionItems = [];
            const { imports } = parseSasqlDocument(document);
            Object.values(imports).forEach((imported) => {
                try {
                    const importSuggestion = new vscode.CompletionItem(imported.alias, vscode.CompletionItemKind.Function);
                    importSuggestion.insertText = new vscode.SnippetString(imported.alias);
                    const commentBlock = imported.sourceFile.comments[0];
                    const commentText = commentBlock?.text;
                    if (commentText) {
                        console.log(commentText);
                        importSuggestion.documentation =
                            new vscode.MarkdownString(commentText);
                    }
                    completionItems.push(importSuggestion);
                }
                catch (e) {
                    console.error(e);
                }
            });
            return completionItems;
        }
    });
}
function parseSasqlDocument(document) {
    try {
        const activePath = document.uri.fsPath;
        const text = document.getText();
        return sasql.parseSourceFile(text, activePath);
    }
    catch (e) {
        console.error(e);
        throw e;
    }
}
//# sourceMappingURL=statement-completion-provider.js.map