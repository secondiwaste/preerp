/**
 * Generate bcrypt password hashes for test users
 * Usage: node generate-password-hash.js [password] [count]
 * 
 * This script generates bcrypt hashes that can be used in the create-test-users.sql file
 */

const bcrypt = require('bcrypt');

// Configuration
const SALT_ROUNDS = 10;
const DEFAULT_PASSWORD = 'TestPass123!';
const DEFAULT_COUNT = 20;

// Get password and count from command line arguments
const password = process.argv[2] || DEFAULT_PASSWORD;
const count = parseInt(process.argv[3]) || DEFAULT_COUNT;

console.log('========================================');
console.log('Password Hash Generator for Test Users');
console.log('========================================');
console.log(`Password: ${password}`);
console.log(`Salt Rounds: ${SALT_ROUNDS}`);
console.log(`Generating hash for ${count} users...`);
console.log('========================================\n');

// Generate the hash (same hash can be used for all users with same password)
bcrypt.hash(password, SALT_ROUNDS, (err, hash) => {
    if (err) {
        console.error('Error generating hash:', err);
        process.exit(1);
    }

    console.log('Generated bcrypt hash:');
    console.log(hash);
    console.log('\n========================================');
    console.log('SQL INSERT Statements:');
    console.log('========================================\n');

    // Generate SQL statements
    console.log('INSERT INTO users (username, password_hash, user_level, disabled) VALUES');
    
    const values = [];
    for (let i = 1; i <= count; i++) {
        values.push(`('testuser${i}', '${hash}', 'user', FALSE)`);
    }
    
    console.log(values.join(',\n'));
    console.log('ON DUPLICATE KEY UPDATE username=username;');
    
    console.log('\n========================================');
    console.log('CSV File Content:');
    console.log('========================================\n');
    
    console.log('username,password');
    for (let i = 1; i <= count; i++) {
        console.log(`testuser${i},${password}`);
    }
    
    console.log('\n========================================');
    console.log('Generation Complete!');
    console.log('========================================');
    
    console.log('\nNext steps:');
    console.log('1. Copy the SQL statements above to create-test-users.sql');
    console.log('2. Copy the CSV content to test-users.csv');
    console.log('3. Run the SQL script in your database');
    console.log('4. Run the JMeter test');
});
