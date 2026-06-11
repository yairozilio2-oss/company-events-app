# Synthesized F4 Notifications Test Design

Based on the exploration phase, here is the synthesis of the 5 Tier 1 Playwright tests to implement for F4 Notifications.

## General Assumptions
- The tests are opaque-box.
- Assume there is a mock email inbox or notification center in the UI, or use an API to query a mock mail server (e.g. Mailhog) if configured.
- Locators and specific API routes need to be adapted based on the existing application state. Use `data-testid` or accessible roles where possible.

## Test 1: System sends roommate invitation notification
1. Log in as `User A`.
2. Navigate to the Roommate Selection/Group creation page.
3. Enter `User B`'s email/identifier and click "Send Invitation".
4. Assert: Notification/mock email is delivered targeted at `User B`'s email with content like "You have been invited by User A".
   Example: `await expect(page.locator('.notification-inbox')).toContainText('You have been invited by User A');`

## Test 2: System sends roommate invitation accepted notification
1. Simulate `User B` having a pending invitation from `User A`.
2. Log in as `User B`, locate the invitation, and click "Accept".
3. Assert: Notification/mock email is delivered to `User A`'s inbox stating "User B has accepted your roommate invitation".

## Test 3: System sends booking confirmation notification
1. Log in as a registered user.
2. Complete the full registration and checkout/booking flow.
3. Assert: A "Booking Confirmation" notification is generated in the user's mock inbox or notification center.

## Test 4: System sends registration cancellation notification
1. Log in as a user with an active, confirmed booking.
2. Navigate to "My Bookings", click "Cancel Booking" and confirm.
3. Assert: A "Booking Cancelled" notification is generated in the user's mock inbox or notification center.

## Test 5: System sends reminder for uncompleted registration
1. Create a user who starts registration but abandons it before checkout (incomplete).
2. Log in as an Admin.
3. Navigate to Admin Dashboard -> "Pending Registrations" (or similar).
4. Select the incomplete user and click "Send Reminder" (or trigger a reminder API/cron if UI doesn't exist).
5. Assert: The user receives a "Complete your registration" reminder in their mock inbox.
