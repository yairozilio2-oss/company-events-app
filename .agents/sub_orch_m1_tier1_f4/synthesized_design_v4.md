# Synthesized F4 Notifications Test Design V4 (Post-Audit Fixes Gen 4)

Based on the Forensic Auditor's Integrity Violation report from Gen 3, the tests must NEVER navigate to `/notifications` (as this is a mock/log-based feature and the UI route does not exist). Furthermore, tests MUST explicitly set up their state and not rely on implicit or missing state.

## CRITICAL INTEGRITY RULES
1. **NO FACADE ROUTES**: Do NOT navigate to `/notifications`. F4 is "Mock/Log based". Assert against the system log file `mock_emails.log` in the root directory.
2. **EXPLICIT SETUP**: You MUST set up the state within each test. E.g., before User D cancels a booking, User D MUST be registered and booked in that same test!
3. **MULTI-USER CONTEXT**: Maintain `const context = await browser.newContext();` for isolation.
4. **SEQUENTIAL EXECUTION**: Wrap the entire test block in `test.describe.serial('F4: Notifications Tier 1 Tests', () => { ... })`.

## Test 1: Roommate Invitation Notification
1. Set up User A context. Register User A.
2. Go to `/roommates` and invite `userB@example.com`.
3. Assert: Read `mock_emails.log` and verify it contains "To: userB@example.com" and "roommate invitation".

## Test 2: Roommate Invitation Accepted Notification
1. Set up User B context. Register User B.
2. Accept the invitation from User A (assuming it exists from Test 1 due to `.serial`).
3. Assert: Read `mock_emails.log` and verify it contains "To: userA@example.com" and "accepted your invitation".

## Test 3: Booking Confirmation Notification
1. Set up User C context. Register User C.
2. Complete checkout and click "Confirm Booking".
3. Assert: Read `mock_emails.log` and verify it contains "Booking Confirmation" for `userC@example.com`.

## Test 4: Registration Cancellation Notification
1. **CRITICAL SETUP**: Set up User D context. Register User D, and book a room (same as Test 3).
2. Go to `/my-bookings` and click "Cancel Booking", then "Confirm Cancellation".
3. Assert: Read `mock_emails.log` and verify it contains "Booking Cancelled" for `userD@example.com`.

## Test 5: Reminder for Uncompleted Registration
1. **CRITICAL SETUP**: Set up User E context. Go to `/register`, fill out the first name/last name, but DO NOT complete checkout. Close context.
2. Set up Admin context. Log in as admin.
3. Go to `/admin/pending-registrations`, locate `userE@example.com`, and click "Send Reminder".
4. Assert: Read `mock_emails.log` and verify it contains "Complete your registration" for `userE@example.com`.

## Assertion Snippet Example
```typescript
import fs from 'fs';
await page.waitForTimeout(1000); // Wait for backend to write log
// Ensure file exists to prevent crash
if (!fs.existsSync('mock_emails.log')) {
    fs.writeFileSync('mock_emails.log', '');
}
const logContent = fs.readFileSync('mock_emails.log', 'utf8');
expect(logContent).toContain('To: userD@example.com');
```
