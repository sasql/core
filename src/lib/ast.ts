import { Token, TokenType } from './types.js';
import {
    ASTNode,
    ProgramNode,
    UseDirectiveNode,
    StatementDirectiveNode,
    SQLStatementNode,
    IncludeDirectiveNode,
    SelectClauseNode,
    FromClauseNode,
    WhereClauseNode,
    ExpressionNode,
    IdentifierNode,
    StringLiteralNode,
    ParameterNode,
    CommentBlockNode,
    SQLClauseNode,
    StatementNode,
    TableReferenceNode,
    SubqueryNode,
    DocTagNode
} from './ast-nodes.js';

export class ASTBuilder {
    private current: number = 0;

    constructor(
        public tokens: Token[],
        public source: string,
        public srcPath: string
    ) {
        this.tokens = tokens;
        this.source = source;
        this.srcPath = srcPath;
    }

    public buildAST(): ProgramNode {
        const body: StatementNode[] = [];
        const imports: UseDirectiveNode[] = [];
        const statements: StatementDirectiveNode[] = [];

        const program: ProgramNode = {
            type: 'Program',
            range: {
                start: { line: 1, character: 1 },
                end: this.getEndPosition()
            },
            body,
            imports,
            statements
        };

        // Parse top-level constructs
        while (!this.isAtEnd()) {
            const node = this.parseTopLevel();
            if (node) {
                switch (node.type) {
                    case 'UseDirective':
                        imports.push(node as UseDirectiveNode);
                        break;
                    case 'StatementDirective':
                        statements.push(node as StatementDirectiveNode);
                        break;
                    case 'SQLStatement':
                        body.push(node as SQLStatementNode);
                        break;
                }
            }
        }

        return program;
    }

    private parseTopLevel(): ASTNode | null {
        // Skip comments and whitespace
        this.skipTrivia();

        if (this.isAtEnd()) return null;

        const token = this.peek();

        // Check for comment blocks (JSDoc)
        if (token.text === '/**') {
            const commentBlock = this.parseCommentBlock();

            // Check if next token is a directive
            if (this.check(TokenType.DIRECTIVE)) {
                const directive = this.parseDirective();
                if (directive && directive.type === 'StatementDirective') {
                    (directive as StatementDirectiveNode).documentation =
                        commentBlock;
                }
                return directive;
            }

            return null; // Standalone comment block
        }

        // Check for directives
        if (this.check(TokenType.DIRECTIVE)) {
            return this.parseDirective();
        }

        // Otherwise, parse as SQL statement
        return this.parseSQLStatement();
    }

    private parseDirective(): ASTNode | null {
        const directive = this.advance();

        switch (directive.text) {
            case '@use':
                return this.parseUseDirective(directive);
            case '@statement':
                return this.parseStatementDirective(directive);
            case '@include':
                return this.parseIncludeDirective(directive);
            default:
                throw new Error(`Unknown directive: ${directive.text}`);
        }
    }

    private parseUseDirective(startToken: Token): UseDirectiveNode {
        const path = this.consume(TokenType.STRING, 'Expected string path');
        this.consume(TokenType.TEXT, "Expected 'as' keyword", 'as');
        const alias = this.consume(TokenType.TEXT, 'Expected alias identifier');
        this.consume(TokenType.PUNCTUATION, "Expected ';'", ';');

        return {
            type: 'UseDirective',
            range: this.getRangeFromTo(startToken, this.previous()),
            path: {
                type: 'StringLiteral',
                range: this.getTokenRange(path),
                value: this.unquoteString(path.text),
                raw: path.text
            } as StringLiteralNode,
            alias: {
                type: 'Identifier',
                range: this.getTokenRange(alias),
                name: alias.text
            } as IdentifierNode
        };
    }

    private parseStatementDirective(startToken: Token): StatementDirectiveNode {
        const name = this.consume(TokenType.TEXT, 'Expected statement name');
        this.consume(TokenType.PUNCTUATION, "Expected '{'", '{');

        const body = this.parseSQLStatementBody();

        this.consume(TokenType.PUNCTUATION, "Expected '}'", '}');

        return {
            type: 'StatementDirective',
            range: this.getRangeFromTo(startToken, this.previous()),
            name: {
                type: 'Identifier',
                range: this.getTokenRange(name),
                name: name.text
            } as IdentifierNode,
            body
        };
    }

    private parseIncludeDirective(startToken: Token): IncludeDirectiveNode {
        const firstId = this.consume(TokenType.TEXT, 'Expected identifier');

        // Check if this is a module.statement or just statement
        if (this.match(TokenType.PUNCTUATION, '.')) {
            const statement = this.consume(
                TokenType.TEXT,
                'Expected statement name'
            );
            this.consume(TokenType.PUNCTUATION, "Expected ';'", ';');

            return {
                type: 'IncludeDirective',
                range: this.getRangeFromTo(startToken, this.previous()),
                module: {
                    type: 'Identifier',
                    range: this.getTokenRange(firstId),
                    name: firstId.text
                } as IdentifierNode,
                statement: {
                    type: 'Identifier',
                    range: this.getTokenRange(statement),
                    name: statement.text
                } as IdentifierNode
            };
        } else {
            this.consume(TokenType.PUNCTUATION, "Expected ';'", ';');
            return {
                type: 'IncludeDirective',
                range: this.getRangeFromTo(startToken, this.previous()),
                statement: {
                    type: 'Identifier',
                    range: this.getTokenRange(firstId),
                    name: firstId.text
                } as IdentifierNode
            };
        }
    }

    private parseSQLStatement(): SQLStatementNode {
        const startToken = this.peek();
        const clauses: SQLClauseNode[] = [];

        // Parse SQL clauses in order
        while (!this.isAtEnd() && !this.checkText('}')) {
            if (this.matchText('SELECT')) {
                clauses.push(this.parseSelectClause());
            } else if (this.matchText('FROM')) {
                clauses.push(this.parseFromClause());
            } else if (this.matchText('WHERE')) {
                clauses.push(this.parseWhereClause());
            } else {
                // Skip unknown tokens or handle other SQL constructs
                this.advance();
            }
        }

        return {
            type: 'SQLStatement',
            range: this.getRangeFromTo(startToken, this.previous()),
            clauses
        };
    }

    private parseSQLStatementBody(): SQLStatementNode {
        // Similar to parseSQLStatement but expects to end at '}'
        const startToken = this.peek();
        const clauses: SQLClauseNode[] = [];

        while (!this.checkText('}') && !this.isAtEnd()) {
            if (this.matchText('SELECT')) {
                clauses.push(this.parseSelectClause());
            } else if (this.matchText('FROM')) {
                clauses.push(this.parseFromClause());
            } else if (this.matchText('WHERE')) {
                clauses.push(this.parseWhereClause());
            } else {
                this.advance();
            }
        }

        return {
            type: 'SQLStatement',
            range: this.getRangeFromTo(startToken, this.previous()),
            clauses
        };
    }

    private parseSelectClause(): SelectClauseNode {
        const startToken = this.previous(); // SELECT token
        const columns: (ExpressionNode | IncludeDirectiveNode)[] = [];

        // Check for DISTINCT
        const distinct = this.matchText('DISTINCT');

        // Parse column list
        do {
            if (
                this.check(TokenType.DIRECTIVE) &&
                this.peek().text === '@include'
            ) {
                columns.push(this.parseIncludeDirective(this.advance()));
            } else {
                columns.push(this.parseExpression());
            }
        } while (this.match(TokenType.PUNCTUATION, ','));

        return {
            type: 'SelectClause',
            range: this.getRangeFromTo(startToken, this.previous()),
            distinct,
            columns
        };
    }

    private parseFromClause(): FromClauseNode {
        const startToken = this.previous(); // FROM token
        const tables: (
            | TableReferenceNode
            | SubqueryNode
            | IncludeDirectiveNode
        )[] = [];

        do {
            if (this.match(TokenType.PUNCTUATION, '(')) {
                // Subquery
                if (
                    this.check(TokenType.DIRECTIVE) &&
                    this.peek().text === '@include'
                ) {
                    // Include directive in subquery
                    tables.push(this.parseIncludeDirective(this.advance()));
                    this.consume(TokenType.PUNCTUATION, "Expected ')'", ')');
                } else {
                    // Regular subquery
                    const subquery = this.parseSQLStatement();
                    this.consume(TokenType.PUNCTUATION, "Expected ')'", ')');

                    // Check for alias
                    let alias: IdentifierNode | undefined;
                    if (this.matchText('as') || this.check(TokenType.TEXT)) {
                        if (this.previous().text.toLowerCase() !== 'as') {
                            this.current--; // Back up if no 'as' keyword
                        }
                        const aliasToken = this.consume(
                            TokenType.TEXT,
                            'Expected alias'
                        );
                        alias = {
                            type: 'Identifier',
                            range: this.getTokenRange(aliasToken),
                            name: aliasToken.text
                        } as IdentifierNode;
                    }

                    const subqueryNode: SubqueryNode = {
                        type: 'Subquery',
                        range: this.getRangeFromTo(startToken, this.previous()),
                        query: subquery,
                        alias
                    };
                    tables.push(subqueryNode);
                }
            } else {
                // Table reference
                tables.push(this.parseTableReference());
            }
        } while (this.match(TokenType.PUNCTUATION, ','));

        return {
            type: 'FromClause',
            range: this.getRangeFromTo(startToken, this.previous()),
            tables
        };
    }

    private parseWhereClause(): WhereClauseNode {
        const startToken = this.previous(); // WHERE token
        const condition = this.parseExpression();

        return {
            type: 'WhereClause',
            range: this.getRangeFromTo(startToken, this.previous()),
            condition
        };
    }

    private parseExpression(): ExpressionNode {
        // Simplified expression parsing
        // In a real implementation, you'd handle operator precedence properly

        if (this.check(TokenType.VARIABLE)) {
            const param = this.advance();
            return {
                type: 'Parameter',
                range: this.getTokenRange(param),
                name: param.text
            } as ParameterNode;
        }

        if (this.check(TokenType.TEXT)) {
            const id = this.advance();
            return {
                type: 'Identifier',
                range: this.getTokenRange(id),
                name: id.text
            } as IdentifierNode;
        }

        // Handle other expression types...
        throw new Error('Unexpected token in expression');
    }

    private parseTableReference(): TableReferenceNode {
        const table = this.consume(TokenType.TEXT, 'Expected table name');

        return {
            type: 'TableReference',
            range: this.getTokenRange(table),
            table: {
                type: 'Identifier',
                range: this.getTokenRange(table),
                name: table.text
            } as IdentifierNode
        };
    }

    private parseCommentBlock(): CommentBlockNode {
        const startToken = this.advance(); // /**
        const descriptionParts: string[] = [];
        const tags: DocTagNode[] = [];

        while (!this.checkText('*/') && !this.isAtEnd()) {
            const token = this.advance();
            if (token.text.startsWith('@')) {
                // Parse doc tag (simplified)
                const docTag: DocTagNode = {
                    type: 'DocTag',
                    range: this.getTokenRange(token),
                    tag: token.text
                };
                tags.push(docTag);
            } else if (token.text !== '*') {
                descriptionParts.push(token.text);
            }
        }

        this.consume(TokenType.PUNCTUATION, "Expected '*/'", '*/');

        return {
            type: 'CommentBlock',
            range: this.getRangeFromTo(startToken, this.previous()),
            description: descriptionParts.join(' '),
            tags
        };
    }

    // Utility methods
    private peek(): Token {
        return this.tokens[this.current];
    }

    private previous(): Token {
        return this.tokens[this.current - 1];
    }

    private isAtEnd(): boolean {
        return this.current >= this.tokens.length;
    }

    private advance(): Token {
        if (!this.isAtEnd()) this.current++;
        return this.previous();
    }

    private check(type: TokenType): boolean {
        if (this.isAtEnd()) return false;
        return this.peek().type === type;
    }

    private checkText(text: string): boolean {
        if (this.isAtEnd()) return false;
        return this.peek().text.toLowerCase() === text.toLowerCase();
    }

    private match(type: TokenType, text?: string): boolean {
        if (this.check(type) && (!text || this.peek().text === text)) {
            this.advance();
            return true;
        }
        return false;
    }

    private matchText(text: string): boolean {
        if (this.checkText(text)) {
            this.advance();
            return true;
        }
        return false;
    }

    private consume(
        type: TokenType,
        message: string,
        expectedText?: string
    ): Token {
        if (
            this.check(type) &&
            (!expectedText || this.peek().text === expectedText)
        ) {
            return this.advance();
        }
        throw new Error(`${message}. Got ${this.peek()?.text || 'EOF'}`);
    }

    private skipTrivia(): void {
        while (!this.isAtEnd()) {
            const token = this.peek();
            if (
                token.type === TokenType.WHITESPACE ||
                token.type === TokenType.COMMENT_LN
            ) {
                this.advance();
            } else {
                break;
            }
        }
    }

    private getTokenRange(token: Token) {
        return {
            start: token.start,
            end: token.end
        };
    }

    private getRangeFromTo(start: Token, end: Token) {
        return {
            start: start.start,
            end: end.end
        };
    }

    private getEndPosition() {
        if (this.tokens.length === 0) {
            return { line: 1, character: 1 };
        }
        const lastToken = this.tokens[this.tokens.length - 1];
        return lastToken.end;
    }

    private unquoteString(str: string): string {
        return str.slice(1, -1); // Remove surrounding quotes
    }
}

// Example usage:
export function parseToAST(
    tokens: Token[],
    source: string,
    srcPath: string
): ProgramNode {
    const builder = new ASTBuilder(tokens, source, srcPath);
    return builder.buildAST();
}
