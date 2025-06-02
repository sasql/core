// Base AST Node interface
export interface ASTNode {
    type: string;
    range: {
        start: { line: number; character: number };
        end: { line: number; character: number };
    };
    parent?: ASTNode;
}

// Root node representing an entire SASQL file
export interface ProgramNode extends ASTNode {
    type: 'Program';
    body: StatementNode[];
    imports: UseDirectiveNode[];
    statements: StatementDirectiveNode[];
}

// Base for all statement types
export interface StatementNode extends ASTNode {
    type: string;
}

// SQL Statement node (for regular SQL)
export interface SQLStatementNode extends StatementNode {
    type: 'SQLStatement';
    clauses: SQLClauseNode[];
}

// Different SQL clause types
export interface SQLClauseNode extends ASTNode {
    type:
        | 'SelectClause'
        | 'FromClause'
        | 'WhereClause'
        | 'OrderByClause'
        | 'GroupByClause';
}

export interface SelectClauseNode extends SQLClauseNode {
    type: 'SelectClause';
    distinct?: boolean;
    columns: (ColumnReferenceNode | ExpressionNode | IncludeDirectiveNode)[];
}

export interface FromClauseNode extends SQLClauseNode {
    type: 'FromClause';
    tables: (TableReferenceNode | SubqueryNode | IncludeDirectiveNode)[];
}

export interface WhereClauseNode extends SQLClauseNode {
    type: 'WhereClause';
    condition: ExpressionNode;
}

// SASQL-specific directive nodes
export interface UseDirectiveNode extends StatementNode {
    type: 'UseDirective';
    path: StringLiteralNode;
    alias: IdentifierNode;
}

export interface IncludeDirectiveNode extends ASTNode {
    type: 'IncludeDirective';
    module?: IdentifierNode; // Optional for local includes
    statement: IdentifierNode;
}

export interface StatementDirectiveNode extends StatementNode {
    type: 'StatementDirective';
    name: IdentifierNode;
    parameters?: ParameterNode[];
    body: SQLStatementNode;
    documentation?: CommentBlockNode;
}

// Expression nodes
export interface ExpressionNode extends ASTNode {
    type: string;
}

export interface BinaryExpressionNode extends ExpressionNode {
    type: 'BinaryExpression';
    left: ExpressionNode;
    operator: string; // '=', '!=', '<', '>', '<=', '>=', 'AND', 'OR', etc.
    right: ExpressionNode;
}

export interface UnaryExpressionNode extends ExpressionNode {
    type: 'UnaryExpression';
    operator: string; // 'NOT', '-', '+', etc.
    operand: ExpressionNode;
}

export interface CallExpressionNode extends ExpressionNode {
    type: 'CallExpression';
    callee: IdentifierNode;
    arguments: ExpressionNode[];
}

// Literal nodes
export interface LiteralNode extends ExpressionNode {
    type: string;
    value: any;
    raw: string; // Original text representation
}

export interface StringLiteralNode extends LiteralNode {
    type: 'StringLiteral';
    value: string;
}

export interface NumberLiteralNode extends LiteralNode {
    type: 'NumberLiteral';
    value: number;
}

export interface BooleanLiteralNode extends LiteralNode {
    type: 'BooleanLiteral';
    value: boolean;
}

export interface NullLiteralNode extends LiteralNode {
    type: 'NullLiteral';
    value: null;
}

// Identifier and reference nodes
export interface IdentifierNode extends ExpressionNode {
    type: 'Identifier';
    name: string;
}

export interface ColumnReferenceNode extends ExpressionNode {
    type: 'ColumnReference';
    table?: IdentifierNode;
    column: IdentifierNode;
    alias?: IdentifierNode;
}

export interface TableReferenceNode extends ExpressionNode {
    type: 'TableReference';
    schema?: IdentifierNode;
    table: IdentifierNode;
    alias?: IdentifierNode;
}

export interface ParameterNode extends ExpressionNode {
    type: 'Parameter';
    name: string; // e.g., "$1", "$2"
    parameterType?: TypeAnnotationNode;
}

// Subquery node
export interface SubqueryNode extends ExpressionNode {
    type: 'Subquery';
    query: SQLStatementNode;
    alias?: IdentifierNode;
}

// Comment and documentation nodes
export interface CommentBlockNode extends ASTNode {
    type: 'CommentBlock';
    description: string;
    tags: DocTagNode[];
}

export interface DocTagNode extends ASTNode {
    type: 'DocTag';
    tag: string; // e.g., '@param', '@returns'
    name?: string; // parameter name
    typeAnnotation?: TypeAnnotationNode;
    description?: string;
}

export interface TypeAnnotationNode extends ASTNode {
    type: 'TypeAnnotation';
    types: string[]; // e.g., ['string'], ['string', 'number']
}

// Example AST for a complete SASQL file
export interface ExampleAST extends ProgramNode {
    type: 'Program';
    range: {
        start: { line: 1; character: 1 };
        end: { line: 10; character: 1 };
    };
    body: [
        // The main SQL statement
        {
            type: 'SQLStatement';
            range: {
                start: { line: 3; character: 1 };
                end: { line: 9; character: 18 };
            };
            clauses: [
                {
                    type: 'SelectClause';
                    range: {
                        start: { line: 3; character: 1 };
                        end: { line: 4; character: 5 };
                    };
                    distinct: false;
                    columns: [
                        {
                            type: 'ColumnReference';
                            range: {
                                start: { line: 4; character: 5 };
                                end: { line: 4; character: 6 };
                            };
                            column: {
                                type: 'Identifier';
                                range: {
                                    start: { line: 4; character: 5 };
                                    end: { line: 4; character: 6 };
                                };
                                name: '*';
                            };
                        }
                    ];
                },
                {
                    type: 'FromClause';
                    range: {
                        start: { line: 5; character: 1 };
                        end: { line: 9; character: 18 };
                    };
                    tables: [
                        {
                            type: 'Subquery';
                            range: {
                                start: { line: 6; character: 5 };
                                end: { line: 8; character: 6 };
                            };
                            query: {
                                type: 'SQLStatement';
                                range: {
                                    start: { line: 7; character: 9 };
                                    end: { line: 7; character: 50 };
                                };
                                clauses: [
                                    // This would be populated by resolving the @include
                                ];
                            };
                            alias: {
                                type: 'Identifier';
                                range: {
                                    start: { line: 9; character: 7 };
                                    end: { line: 9; character: 18 };
                                };
                                name: 'my_sub_stmt';
                            };
                        }
                    ];
                }
            ];
        }
    ];
    imports: [
        {
            type: 'UseDirective';
            range: {
                start: { line: 1; character: 1 };
                end: { line: 1; character: 47 };
            };
            path: {
                type: 'StringLiteral';
                range: {
                    start: { line: 1; character: 6 };
                    end: { line: 1; character: 32 };
                };
                value: './statements/statement';
                raw: "'./statements/statement'";
            };
            alias: {
                type: 'Identifier';
                range: {
                    start: { line: 1; character: 36 };
                    end: { line: 1; character: 45 };
                };
                name: 'my_import';
            };
        }
    ];
    statements: []; // No local statement definitions in this example
}
