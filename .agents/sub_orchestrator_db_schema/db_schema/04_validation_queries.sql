-- 04_validation_queries.sql
-- Validation queries for the registration schema

-- 1. Check for duplicate emails (should be zero)
SELECT email, COUNT(*) AS cnt
FROM users
GROUP BY email
HAVING COUNT(*) > 1;

-- 2. Verify that each user profile has a corresponding user
SELECT up.user_id
FROM user_profiles up
LEFT JOIN users u ON up.user_id = u.id
WHERE u.id IS NULL;

-- 3. Verify that each verification token references an existing user
SELECT ev.id, ev.token
FROM email_verifications ev
LEFT JOIN users u ON ev.user_id = u.id
WHERE u.id IS NULL;

-- 4. Check for expired but unused verification tokens
SELECT id, token, expires_at
FROM email_verifications
WHERE expires_at < CURRENT_TIMESTAMP AND is_used = FALSE;
