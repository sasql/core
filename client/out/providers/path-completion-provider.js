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
exports.registerPathCompletionProvider = registerPathCompletionProvider;
const vscode = __importStar(require("vscode"));
const path_1 = require("path");
const fs_1 = require("fs");
function registerPathCompletionProvider() {
    vscode.languages.registerCompletionItemProvider({
        language: 'sasql'
    }, {
        provideCompletionItems(document, range) {
            const completionItems = [];
            const line = document.lineAt(range.line);
            const lineStart = line.text.substring(0, range.character);
            const pathStart = lineStart.match(/["'][.\/a-z_-]*$/);
            const matches = Array.from(pathStart ?? []);
            if (matches.length === 0) {
                return;
            }
            const relativePath = matches[0].substring(1, matches[0].length);
            const fileDirectory = (0, path_1.dirname)(document.uri.fsPath);
            (0, fs_1.readdirSync)((0, path_1.join)(fileDirectory, relativePath)).forEach((p) => {
                if ((0, fs_1.statSync)((0, path_1.join)(fileDirectory, p)).isDirectory()) {
                    completionItems.push({
                        kind: vscode.CompletionItemKind.Folder,
                        label: (0, path_1.join)(fileDirectory, p)
                    });
                }
                else if (p.endsWith('.sasql')) {
                    completionItems.push({
                        kind: vscode.CompletionItemKind.File,
                        label: (0, path_1.join)(fileDirectory, p)
                    });
                }
            });
            return completionItems;
        }
    }, '/');
}
//# sourceMappingURL=path-completion-provider.js.map