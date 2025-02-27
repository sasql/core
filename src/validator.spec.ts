import { validatePostgresQuery, formatErrorMessages } from '../src/validate.js';

describe('validatePostgresQuery', () => {
  test('should validate a correct simple query', () => {
    const sql = 'SELECT * FROM users WHERE id = 1';
    const result = validatePostgresQuery(sql);
    
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.enhancedErrors).toHaveLength(0);
  });

  test('should detect missing FROM clause', () => {
    const sql = 'SELECT * WHERE id = 1';
    const result = validatePostgresQuery(sql);
    
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('SELECT statement without FROM clause');
  });

  test('should detect missing SELECT statement', () => {
    const sql = 'FROM users WHERE id = 1';
    const result = validatePostgresQuery(sql);
    
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Query missing SELECT statement');
  });

  test('should detect unmatched parentheses (more closing)', () => {
    const sql = 'SELECT * FROM users WHERE (id = 1))';
    const result = validatePostgresQuery(sql);
    
    expect(result.valid).toBe(false);
    expect(result.errors.some(err => err.includes('Unmatched closing parenthesis'))).toBe(true);
  });

  test('should detect unmatched parentheses (more opening)', () => {
    const sql = 'SELECT * FROM users WHERE ((id = 1)';
    const result = validatePostgresQuery(sql);
    
    expect(result.valid).toBe(false);
    expect(result.errors.some(err => err.includes('Unmatched parentheses'))).toBe(true);
  });

  test('should detect JOIN without ON or USING', () => {
    const sql = 'SELECT u.id, o.id FROM users u JOIN orders o';
    const result = validatePostgresQuery(sql);
    
    expect(result.valid).toBe(false);
    expect(result.errors.some(err => err.includes('JOIN without ON or USING'))).toBe(true);
  });

  test('should include line and column information in enhancedErrors', () => {
    const sql = 'SELECT * FROM users WHERE (id = 1))';
    const result = validatePostgresQuery(sql);
    
    expect(result.enhancedErrors.length).toBeGreaterThan(0);
    
    const error = result.enhancedErrors.find(err => 
      err.message.includes('Unmatched closing parenthesis')
    );
    
    expect(error).toBeDefined();
    expect(error?.line).toBeGreaterThan(0);
    expect(error?.column).toBeGreaterThan(0);
    expect(error?.lineContent).toContain('SELECT * FROM users WHERE (id = 1))');
    expect(error?.pointer).toBeDefined();
  });

  test('should handle multiple errors in a single query', () => {
    const sql = 'SELECT FROM users JOIN orders WHERE id = 1)';
    const result = validatePostgresQuery(sql);
    
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(1);
  });
});

describe('formatErrorMessages', () => {
  test('should format basic error messages', () => {
    const sql = 'SELECT * FROM users WHERE (id = 1))';
    const validationResult = validatePostgresQuery(sql);
    const formattedErrors = formatErrorMessages(validationResult);
    
    expect(formattedErrors.length).toBeGreaterThan(0);
    
    // Each formatted error should include the error message and the line info
    const errorMessage = formattedErrors[0];
    expect(errorMessage).toContain('Error:');
    expect(errorMessage).toContain('Line');
    expect(errorMessage).toContain('SELECT * FROM users WHERE (id = 1))');
    expect(errorMessage).toContain('^'); // The pointer
  });

  test('should handle errors without specific line information', () => {
    // Create a mock validation result with a generic error
    const mockValidationResult = {
      valid: false,
      errors: ['Generic error without line information'],
      enhancedErrors: [{
        message: 'Generic error without line information',
        line: 0,
        column: 0,
        lineContent: '',
        pointer: ''
      }]
    };
    
    const formattedErrors = formatErrorMessages(mockValidationResult);
    
    expect(formattedErrors).toContain('Generic error without line information');
  });
});