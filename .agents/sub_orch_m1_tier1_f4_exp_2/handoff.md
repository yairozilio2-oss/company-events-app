# Handoff: Tier 1 Feature Tests for F4 (Notifications)

## 1. Observation
- **Requirement F4**: "Automatic Notifications: The system should send automated notifications (or mock emails) for roommate invitations, booking confirmations, changes/cancellations, and reminders for uncompleted registrations."
- **Target Scope**: 5 distinct, self-contained Tier 1 Playwright tests for happy-path feature validation.
- **Target File**: `tests/e2e/tier1_feature/f4_notifications.spec.ts`

## 2. Logic Chain
To validate the F4 feature via opaque-box testing in Playwright, we must simulate user workflows that trigger the target notifications and verify their delivery via the UI (e.g., in-app notification center or mocked email inbox/toast alerts).

**Test 1: Roommate invitation sent**
- *Step-by-step logic*:
  1. Log in as User A.
  2. Navigate to the "Roommates" or "Groups" management page.
  3. Enter User B's identifier (email/username) and click "Send Invitation".
  4. Verify that a success toast appears and a mock email/notification log confirms sending.
- *Playwright assertions*:
  - `await expect(page.locator('.toast-success')).toContainText('Invitation sent');`
  - `await expect(page.locator('#mock-email-log')).toContainText('You have been invited to be roommates');`

**Test 2: Roommate invitation accepted**
- *Step-by-step logic*:
  1. Log in as User B (the invitee).
  2. Navigate to the notifications/invitations center.
  3. Click "Accept" on the pending roommate invitation from User A.
  4. Log in as User A (or intercept mock notification endpoint).
  5. Verify User A received a notification that the invite was accepted.
- *Playwright assertions*:
  - `await expect(page.locator('.notification-item')).toContainText('User B accepted your roommate invitation');`

**Test 3: Booking confirmation**
- *Step-by-step logic*:
  1. Log in as a registered user.
  2. Select an available room and complete the checkout/booking flow.
  3. Navigate to the notifications center or mock email log.
  4. Verify the booking confirmation notification is present.
- *Playwright assertions*:
  - `await expect(page.locator('.notification-item')).toContainText('Booking confirmed');`
  - `await expect(page.locator('.notification-item')).toContainText('Room successfully booked');`

**Test 4: Registration cancellation**
- *Step-by-step logic*:
  1. Log in as a user with an active booking.
  2. Navigate to "My Bookings" and click "Cancel Booking".
  3. Confirm the cancellation prompt.
  4. Navigate to the notifications center or mock email log.
  5. Verify a cancellation notification has been recorded.
- *Playwright assertions*:
  - `await expect(page.locator('.notification-item')).toContainText('Booking cancelled successfully');`

**Test 5: Uncompleted registration reminder**
- *Step-by-step logic*:
  1. Log in as an Admin user.
  2. Navigate to the "User Management" or "Registrations" dashboard.
  3. Filter for "Incomplete" registrations.
  4. Select an incomplete user and click "Send Reminder".
  5. Intercept the notification system (or switch to the target user's mock inbox) and verify the reminder was sent.
- *Playwright assertions*:
  - `await expect(page.locator('.admin-toast-success')).toContainText('Reminder sent');`
  - `await expect(page.locator('#mock-email-log')).toContainText('Please complete your registration');`

## 3. Caveats
- Assumes the existence of an in-app notification center (`.notification-item`), mock email log (`#mock-email-log`), or toast alerts (`.toast-success`) for opaque-box verification.
- Test 2 (Acceptance) and Test 5 (Admin Reminder) require multi-role orchestration or mocked endpoints to verify delivery across different user sessions.
- No implementation logic is written, relying on the test implementer to adapt the locators to the actual DOM structure.

## 4. Conclusion
The 5 designed Playwright tests effectively cover the required happy paths for F4 (Automatic Notifications). Implementing these in `tests/e2e/tier1_feature/f4_notifications.spec.ts` will ensure that all core notification triggers are continuously validated without checking internal application state.

## 5. Verification Method
- Once implemented, verify by running: `npx playwright test tests/e2e/tier1_feature/f4_notifications.spec.ts`
- Invalidation: Tests should fail if the mock notification layer or real notification elements are decoupled or removed from the DOM.
