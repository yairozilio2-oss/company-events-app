# Synthesized F4 Notifications Test Design V3 (Post-Audit Fixes Gen 3)

Based on the Forensic Auditor's Integrity Violation report from Gen 2, the tests must be wrapped in `test.describe.serial` to enforce sequential execution if they share state (like Test 1 and Test 2). Also, unique users MUST be used for different states to prevent state collisions.

## CRITICAL INTEGRITY RULES
1. **NO CONDITIONAL UI CHECKS**: Do NOT use `if (await element.isVisible())`. If an element is missing, the test MUST crash and fail. Use direct actions.
2. **MULTI-USER CONTEXT**: You cannot check User B's notifications while logged in as User A. Use `const contextB = await browser.newContext();` to simulate another user concurrently, or log out and log in again.
3. **SEQUENTIAL EXECUTION**: Wrap the entire test block in `test.describe.serial('F4: Notifications Tier 1 Tests', () => { ... })`.
4. **DATA SEGREGATION**: Use distinct users to prevent state bleed!
   - Test 1 & 2: `userA@example.com` and `userB@example.com`
   - Test 3: `userC@example.com`
   - Test 4: `userD@example.com`
   - Test 5: `userE@example.com`

## Test 1: System sends roommate invitation notification
1. Create a new browser context for User A.
2. Log in as `userA@example.com`.
3. Navigate to the Roommate Selection/Group creation page.
4. Enter `userB@example.com`'s identifier and click "Send Invitation".
5. Assert: Notification/mock email is delivered to `userB@example.com` (check User B's context/inbox).

## Test 2: System sends roommate invitation accepted notification
1. Create a new browser context for User B.
2. Log in as `userB@example.com`.
3. Go to "Invitations", and click "Accept" on the invite from User A (which exists because `test.describe.serial` ran Test 1 first).
4. Assert: Notification is delivered to `userA@example.com` stating "User B has accepted your roommate invitation" (check User A's context/inbox).

## Test 3: System sends booking confirmation notification
1. Create a new browser context for User C.
2. Log in as `userC@example.com`.
3. Complete the full registration and checkout/booking flow.
4. Assert: A "Booking Confirmation" notification is present.

## Test 4: System sends registration cancellation notification
1. Create a new browser context for User D.
2. Log in as `userD@example.com`.
3. Navigate to "My Bookings" (assume User D already has a booking, or book it quickly).
4. Click "Cancel Booking" and confirm.
5. Assert: A "Booking Cancelled" notification is present.

## Test 5: System sends reminder for uncompleted registration
1. Create a new browser context for Admin.
2. Log in as Admin.
3. Navigate to Admin Dashboard -> "Pending Registrations".
4. Select `userE@example.com` (who has abandoned their cart and is distinct from User C) and click "Send Reminder".
5. Assert: `userE@example.com` receives a "Complete your registration" reminder.
