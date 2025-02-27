import { tokenize } from '../src/tokenize.js';

describe('tokenize', () => {
  test('should tokenize a simple SELECT statement', () => {
    const sql = 'SELECT * FROM users';
    const tokens = tokenize(sql);
    
    expect(tokens).toContainEqual(expect.objectContaining({
      type: 'keyword',
      value: 'SELECT',
    }));
    
    expect(tokens).toContainEqual(expect.objectContaining({
      type: 'operator',
      value: '*',
    }));
    
    expect(tokens).toContainEqual(expect.objectContaining({
      type: 'keyword',
      value: 'FROM',
    }));
    
    expect(tokens).toContainEqual(expect.objectContaining({
      type: 'identifier',
      value: 'users',
    }));
  });

  test('should handle quoted identifiers', () => {
    const sql = 'SELECT "user_id" FROM "public"."users"';
    const tokens = tokenize(sql);
    
    expect(tokens).toContainEqual(expect.objectContaining({
      type: 'identifier',
      value: '"user_id"',
    }));
    
    expect(tokens).toContainEqual(expect.objectContaining({
      type: 'identifier',
      value: '"public"',
    }));
    
    expect(tokens).toContainEqual(expect.objectContaining({
      type: 'identifier',
      value: '"users"',
    }));
  });

  test('should handle string literals', () => {
    const sql = "SELECT * FROM users WHERE name = 'John''s'";
    const tokens = tokenize(sql);
    
    expect(tokens).toContainEqual(expect.objectContaining({
      type: 'literal',
      value: "'John''s'",
    }));
  });

  test('should handle numeric literals', () => {
    const sql = 'SELECT * FROM users WHERE age > 25.5';
    const tokens = tokenize(sql);
    
    expect(tokens).toContainEqual(expect.objectContaining({
      type: 'literal',
      value: '25.5',
    }));
  });

  test('should handle comments', () => {
    const sql = 'SELECT * FROM users -- Get all users\nWHERE active = true';
    const tokens = tokenize(sql);
    
    expect(tokens).toContainEqual(expect.objectContaining({
      type: 'comment',
      value: '-- Get all users',
    }));
  });

  test('should handle multi-character operators', () => {
    const sql = 'SELECT * FROM users WHERE id <> 5 AND data @> \'{"key": "value"}\'';
    const tokens = tokenize(sql);
    
    expect(tokens).toContainEqual(expect.objectContaining({
      type: 'operator',
      value: '<>',
    }));
    
    expect(tokens).toContainEqual(expect.objectContaining({
      type: 'operator',
      value: '@>',
    }));
  });

  test('should handle parameter markers', () => {
    const sql = 'SELECT * FROM users WHERE id = $1 AND name = $2';
    const tokens = tokenize(sql);
    
    expect(tokens).toContainEqual(expect.objectContaining({
      type: 'parameter',
      value: '$1',
    }));
    
    expect(tokens).toContainEqual(expect.objectContaining({
      type: 'parameter',
      value: '$2',
    }));
  });

  test('should track line and column positions', () => {
    const sql = 'SELECT *\nFROM users\nWHERE id = 1';
    const tokens = tokenize(sql);
    
    // SELECT should be on line 1, column 1
    expect(tokens.find(t => t.type === 'keyword' && t.value === 'SELECT')).toEqual(
      expect.objectContaining({
        line: 1,
        column: 1,
      })
    );
    
    // FROM should be on line 2, column 1
    expect(tokens.find(t => t.type === 'keyword' && t.value === 'FROM')).toEqual(
      expect.objectContaining({
        line: 2,
        column: 1,
      })
    );
    
    // WHERE should be on line 3, column 1
    expect(tokens.find(t => t.type === 'keyword' && t.value === 'WHERE')).toEqual(
      expect.objectContaining({
        line: 3,
        column: 1,
      })
    );
  });
});