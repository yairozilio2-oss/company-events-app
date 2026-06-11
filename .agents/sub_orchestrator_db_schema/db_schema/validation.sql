-- Validation queries for Registration schema

-- 1. Verify that email column is unique (should return zero duplicate rows)
SELECT email, COUNT(*) FROM users GROUP BY email HAVING COUNT(*) > 1;

-- 2. Verify that verification_token column is unique (if not null)
SELECT verification_token, COUNT(*) FROM users WHERE verification_token IS NOT NULL GROUP BY verification_token HAVING COUNT(*) > 1;

-- 3. Verify foreign key integrity between profiles and users
SELECT p.user_id FROM profiles p LEFT JOIN users u ON p.user_id = u.id WHERE u.id IS NULL;

-- 4. Simple count checks
SELECT COUNT(*) AS total_users FROM users;
SELECT COUNT(*) AS total_profiles FROM profiles;
