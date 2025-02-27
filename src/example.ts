import { formatAndValidatePostgresQuery } from './format-and-validate.js';

// Example with a valid query
const validQuery = `
SELECT p.id, p.name, p.created_at, COUNT(u.id) as user_count FROM projects p 
LEFT JOIN users u ON p.id = u.project_id WHERE p.active = true AND (u.role = 'admin' OR u.role = 'editor') 
GROUP BY p.id ORDER BY p.created_at DESC LIMIT $1 OFFSET $2
`;

console.log('===== Testing Valid Query =====');
const validResult = formatAndValidatePostgresQuery(validQuery);
console.log('Valid:', validResult.valid);
console.log('Formatted Query:');
console.log(validResult.formatted);
console.log('\n');

// Example with errors
const invalidQuery = `
SELECT p.id, p.name, p.created_at, COUNT(u.id as user_count FROM projects p 
LEFT JOIN users u WHERE p.active = true AND (u.role = 'admin' OR u.role = 'editor' 
GROUP BY p.id ORDER BY p.created_at DESC LIMIT $1 OFFSET $2
`;

console.log('===== Testing Invalid Query =====');
const invalidResult = formatAndValidatePostgresQuery(invalidQuery);
console.log('Valid:', invalidResult.valid);
console.log('Errors with Context:');
invalidResult.formattedErrors.forEach((error, index) => {
    console.log(`\nError ${index + 1}:`);
    console.log(error);
});
