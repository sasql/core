import { formatAndValidatePostgresQuery } from '../src/format-and-validate.js';

describe('formatAndValidatePostgresQuery', () => {
  test('should correctly format and validate a valid query', () => {
    const sql = /*sql*/ `
      SELECT id, name, email 
      FROM users 
      WHERE active = true 
      ORDER BY created_at DESC
    `;
    
    const result = formatAndValidatePostgresQuery(sql);
    
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.formattedErrors).toHaveLength(0);
    expect(result.formatted).toBeDefined();
    expect(result.formatted).toContain('SELECT id,\n    name,\n    email\nFROM users\nWHERE active = true\nORDER BY created_at DESC');
  });

  test('should detect and report errors for invalid queries', () => {
    const sql = /*sql*/ `
      SELECT id, name, email 
      FROM users 
      JOIN orders 
      WHERE active = true 
      ORDER BY created_at DESC
    `;
    
    const result = formatAndValidatePostgresQuery(sql);
    
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.formattedErrors.length).toBeGreaterThan(0);
    expect(result.formatted).toEqual(sql); // For invalid queries, original SQL should be returned
  });

  test('should handle complex queries with subqueries and joins', () => {
    const sql = /*sql*/ `
      SELECT u.id, u.name, 
      (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) as order_count,
      a.street, a.city, a.country
      FROM users u
      LEFT JOIN addresses a ON u.address_id = a.id
      WHERE u.active = true AND (
        u.role = 'admin' OR 
        u.created_at > '2020-01-01'
      )
      GROUP BY u.id, a.street, a.city, a.country
      HAVING COUNT(DISTINCT a.id) > 0
      ORDER BY u.name ASC
      LIMIT 100 OFFSET 0
    `;
    
    const result = formatAndValidatePostgresQuery(sql);
    
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.formatted).toBeDefined();
    
    // Check that key formatting elements are present
    expect(result.formatted).toContain('SELECT u.id,');
    expect(result.formatted).toContain('FROM users u');
    expect(result.formatted).toContain('LEFT JOIN addresses a ON u.address_id = a.id');
    expect(result.formatted).toContain('WHERE u.active = true AND (');
    expect(result.formatted).toContain('GROUP BY u.id,');
    expect(result.formatted).toContain('HAVING COUNT(DISTINCT a.id) > 0');
    expect(result.formatted).toContain('ORDER BY u.name ASC');
    expect(result.formatted).toContain('LIMIT 100 OFFSET 0');
  });

  test('should handle edge cases with multiple validation errors', () => {
    const sql = /*sql*/ `
      SELECT id, name, 
      FROM users
      JOIN orders
      WHERE (id = 1))
    `;
    
    const result = formatAndValidatePostgresQuery(sql);
    
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(1); // Should catch multiple errors
    expect(result.formattedErrors.length).toBeGreaterThan(1);
    
    // Check that specific error types are detected
    const errorMessages = result.errors.join(' ');
    expect(errorMessages).toContain('JOIN without ON or USING');
    expect(errorMessages).toContain('Unmatched closing parenthesis');
  });
});