# Handoff Report: Tier 1 Feature Tests for F4 (Notifications)

## 1. Observation
- **Feature F4:** Requires the system to send automated notifications (or mock emails) for roommate invitations, booking confirmations, changes/cancellations, and reminders for uncompleted registrations.
- **Scope:** 5 Tier 1 (happy path) Playwright opaque-box tests targeting `tests/e2e/tier1_feature/f4_notifications.spec.ts`.
- **Constraint:** Do not implement the code, but provide step-by-step logic and specific Playwright assertions for the required 5 tests.

## 2. Logic Chain
To properly verify notifications from an opaque-box perspective, the tests assume a mechanism exists to check "sent" notifications (e.g., an in-app notification center, a mock email mailbox UI like Mailhog, or an exposed API endpoint for testing). 

Here are the 5 designed tests:

### Test 1: Roommate Invitation Sent Notification
**Objective:** Verify that when a user invites a roommate, an invitation notification is sent.
- **Steps:**
  1. Log in as User A.
  2. Navigate to the Roommate Selection/Group creation page.
  3. Enter User B's email and click "Send Invitation".
  4. Log in as User B (or navigate to User B's mock inbox).
- **Playwright Assertions:**
  - `await expect(page.locator('.notification-inbox')).toContainText('You have been invited by User A');`
  - `await expect(page.getByRole('button', { name: 'Accept Invitation' })).toBeVisible();`

### Test 2: Roommate Invitation Accepted Notification
**Objective:** Verify that when an invitee accepts an invitation, the inviter receives a confirmation notification.
- **Steps:**
  1. Have User B log in, locate User A's invitation, and click "Accept".
  2. Log in as User A (or navigate to User A's mock inbox).
- **Playwright Assertions:**
  - `await expect(page.locator('.notification-inbox')).toContainText('User B has accepted your roommate invitation');`

### Test 3: Booking Confirmation Notification
**Objective:** Verify that upon successful registration and payment/checkout, a booking confirmation notification is generated.
- **Steps:**
  1. Log in as User A.
  2. Complete the full registration and checkout flow.
  3. Submit the payment successfully.
  4. Navigate to User A's email/notification inbox.
- **Playwright Assertions:**
  - `await expect(page.locator('.notification-inbox')).toContainText('Booking Confirmation');`
  - `await expect(page.locator('.notification-body')).toContainText('Your registration is confirmed');`

### Test 4: Registration Cancellation Notification
**Objective:** Verify that cancelling an existing registration triggers a cancellation notification.
- **Steps:**
  1. Log in as User A (who already has a confirmed booking).
  2. Navigate to "My Bookings".
  3. Click "Cancel Booking" and confirm the action.
  4. Navigate to User A's email/notification inbox.
- **Playwright Assertions:**
  - `await expect(page.locator('.notification-inbox')).toContainText('Booking Cancelled');`
  - `await expect(page.locator('.notification-body')).toContainText('Your booking has been successfully cancelled');`

### Test 5: Uncompleted Registration Reminder Notification
**Objective:** Verify that users with incomplete registrations receive a reminder (simulated via admin trigger).
- **Steps:**
  1. Create User C who starts registration but abandons it before checkout.
  2. Log in as Admin.
  3. Navigate to the Admin Dashboard -> "Pending Registrations".
  4. Select User C and click "Send Reminder".
  5. Log in as User C (or check User C's mock inbox).
- **Playwright Assertions:**
  - `await expect(page.locator('.notification-inbox')).toContainText('Complete your registration');`
  - `await expect(page.getByRole('link', { name: 'Resume Registration' })).toBeVisible();`

## 3. Caveats
- **Mail/Notification Mocking:** Since this is an opaque-box test suite, these designs assume that notifications can be intercepted and verified on the UI (e.g., an `/inbox` route, an embedded mail mocking service, or an API exposed to the frontend). If notifications are purely external emails, a service like Mailhog might need to be queried via API in the Playwright test.
- **State Setup:** Test 4 assumes a helper exists to seed a confirmed booking, and Test 5 assumes an admin role and UI exist to trigger reminders.

## 4. Conclusion
The 5 requested Tier 1 Feature tests for F4 (Notifications) have been fully designed. They map directly to the F4 requirements (sent invites, accepted invites, confirmations, cancellations, and reminders) and include specific Playwright steps and assertions ready for the implementer agent.

## 5. Verification Method
- Review this report against the `F4` requirements and confirm that all 5 events are covered.
- The implementer will translate these steps into Playwright test code in `tests/e2e/tier1_feature/f4_notifications.spec.ts` and run `npx playwright test` to verify.
