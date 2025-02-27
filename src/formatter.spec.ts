import { formatPostgresQuery } from '../src/formatter.js';

describe('formatPostgresQuery', () => {
  test('should format a simple SELECT query with proper indentation', () => {
    const sql = 'SELECT id, name FROM users WHERE active = true';
    const formatted = formatPostgresQuery(sql);
    
    expect(formatted).toContain('SELECT id, name\nFROM users\nWHERE active = true');
  });

  test('should format SELECT clauses with commas at the end of lines', () => {
    const sql = 'SELECT id, name, email, created_at FROM users';
    const formatted = formatPostgresQuery(sql);
    
    expect(formatted).toContain('SELECT id,\n    name,\n    email,\n    created_at\nFROM users');
  });

  test('should properly indent after opening parentheses', () => {
    const sql = 'SELECT * FROM users WHERE (active = true AND (role = \'admin\' OR role = \'user\'))';
    const formatted = formatPostgresQuery(sql);
    
    expect(formatted).toContain('WHERE (');
    expect(formatted).toContain('    active = true AND (');
    expect(formatted).toContain('        role = \'admin\' OR role = \'user\'');
  });

  test('should properly format complex queries with multiple clauses', () => {
    const sql = 'SELECT u.id, u.name, COUNT(o.id) as order_count FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE u.active = true GROUP BY u.id HAVING COUNT(o.id) > 0 ORDER BY order_count DESC LIMIT 10';
    const formatted = formatPostgresQuery(sql);
    
    expect(formatted).toContain('SELECT u.id,\n    u.name,\n    COUNT(o.id) as order_count\nFROM users u\nLEFT JOIN orders o ON u.id = o.user_id\nWHERE u.active = true\nGROUP BY u.id\nHAVING COUNT(o.id) > 0\nORDER BY order_count DESC\nLIMIT 10');
  });

  test('should preserve indentation of subqueries', () => {
    const sql = 'SELECT * FROM (SELECT id, name FROM users WHERE active = true) AS active_users';
    const formatted = formatPostgresQuery(sql);
    
    // The subquery should be indented inside the parentheses
    expect(formatted).toContain('FROM (\n    SELECT id,\n        name\n    FROM users\n    WHERE active = true\n) AS active_users');
  });

  test('should ignore original whitespace in the input', () => {
    const sql1 = 'SELECT id,name FROM users';
    const sql2 = 'SELECT  id,  name   FROM    users';
    
    const formatted1 = formatPostgresQuery(sql1);
    const formatted2 = formatPostgresQuery(sql2);
    
    // Both should produce the same formatted output regardless of original spacing
    expect(formatted1).toEqual(formatted2);
  });

  test('should handle case insensitivity of SQL keywords', () => {
    const sql1 = 'SELECT id FROM users WHERE active = true';
    const sql2 = 'select id from users where active = true';
    
    const formatted1 = formatPostgresQuery(sql1);
    const formatted2 = formatPostgresQuery(sql2);
    
    // The formatter should preserve the original case of keywords
    expect(formatted1).toContain('SELECT');
    expect(formatted2).toContain('select');
  });
});