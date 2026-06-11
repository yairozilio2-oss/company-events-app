# Synthesized F4 Notifications Test Design V2 (Post-Audit Fixes)

Based on the initial design and the Forensic Auditor's Integrity Violation report, here is the updated design for the 5 Tier 1 Playwright tests for F4 Notifications.

## CRITICAL INTEGRITY RULES
1. **NO CONDITIONAL UI CHECKS**: Do NOT use `if (await element.isVisible())`. If an element is missing, the test MUST crash and fail. Use direct actions like `await page.getByTestId('registration-submit-btn').click();`.
2. **MULTI-USER CONTEXT**: You cannot check User B's notifications while logged in as User A. Use `const contextB = await browser.newContext(); const pageB = await contextB.newPage();` to log in as User B and verify the receipt of notifications, or explicitly log out User A and log in as User B.

## Test 1: System sends roommate invitation notification
1. Log in as `User A` (Page A).
2. Navigate to the Roommate Selection/Group creation page.
3. Enter `User B`'s identifier and click "Send Invitation".
4. Open a new browser context for `User B` (Page B) and log in.
5. Navigate to `/notifications` on Page B.
6. Assert: Page B's notification inbox contains "You have been invited by User A".

## Test 2: System sends roommate invitation accepted notification
1. Simulate `User B` having a pending invitation from `User A`.
2. Log in as `User B` (Page B), locate the invitation, and click "Accept".
3. Open a new browser context for `User A` (Page A) and log in.
4. Navigate to `/notifications` on Page A.
5. Assert: Page A's notification inbox contains "User B has accepted your roommate invitation".

## Test 3: System sends booking confirmation notification
1. Log in as a registered user.
2. Complete the full registration and checkout/booking flow. Do NOT use conditional clicks.
3. Navigate to `/notifications`.
4. Assert: A "Booking Confirmation" notification is present.

## Test 4: System sends registration cancellation notification
1. Log in as a user with an active booking.
2. Navigate to "My Bookings", click "Cancel Booking".
3. Assert: A "Booking Cancelled" notification is present in `/notifications`.

## Test 5: System sends reminder for uncompleted registration
1. Create a user `User C` who starts registration but abandons it before checkout.
2. Log in as an `Admin` (Page Admin).
3. Navigate to Admin Dashboard -> "Pending Registrations".
4. Select `User C` and click "Send Reminder" (do NOT use conditional clicks).
5. Open a new browser context for `User C` (Page C) and log in.
6. Navigate to `/notifications` on Page C.
7. Assert: Page C's inbox contains "Complete your registration".
