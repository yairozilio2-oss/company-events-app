# Tier 1 Feature Tests for F4 (Notifications)

## Observation
1. The previous iteration failed the forensic audit because it split sequential, multi-step flows across independent Playwright `test()` blocks without `.serial` modifiers.
2. The previous tests had severe state conflicts, specifically where Test 3 completely booked `userC@example.com`, but Test 5 expected `userC@example.com` to be pending.
3. The previous multi-user tests failed to handle context isolation properly across dependent tests.

## Logic Chain
1. To address the parallel execution issue, the test suite must be enclosed in a `test.describe.serial` block. This guarantees that Playwright executes the tests sequentially, preserving state across Test 1 and Test 2.
2. To address the multi-user state conflicts, unique users must be provisioned for different application states. Test 3 will use `userC@example.com` (fully booked), Test 4 will use `userD@example.com` (payment), and Test 5 will use `userE@example.com` (pending registration).
3. To address multi-user isolation during tests that simulate sender/receiver interactions, `browser.newContext()` must be instantiated to cleanly separate the sender's session from the receiver's session.

## Caveats
- Using `test.describe.serial` means if an earlier test (e.g., Test 1) fails, subsequent dependent tests (e.g., Test 2) will also fail or be skipped.
- The design assumes test data (e.g., user credentials) is available or dynamically seeded before the suite starts.

## Conclusion
Here is the step-by-step logic and Playwright assertions for the 5 distinct, self-contained Tier 1 tests for F4, applying the `test.describe.serial` modifier and strict context/user isolation.

### Test Suite Definition
Wrap all tests in: `test.describe.serial('F4 Notifications Tier 1', () => { ... });`

### Test 1: System sends roommate invitation notification
- **User**: `userA@example.com` (Sender), `userB@example.com` (Receiver)
- **Logic**:
  1. Initialize `contextA` for User A and `contextB` for User B using `browser.newContext()`.
  2. User A logs in on `pageA`, navigates to Roommate Search, and sends an invite to User B.
  3. User B logs in on `pageB` and navigates to the Notifications dashboard.
- **Assertions**:
  - `expect(pageB.locator('.notification-list')).toContainText('User A invited you to be roommates');`

### Test 2: System sends roommate invitation accepted notification
- **User**: `userB@example.com` (Acceptor), `userA@example.com` (Receiver)
- **Logic**:
  1. (Relies on Test 1 state). Initialize `contextB` for User B and `contextA` for User A using `browser.newContext()`.
  2. User B logs in on `pageB`, navigates to Notifications, and clicks "Accept" on User A's invitation.
  3. User A logs in on `pageA` and navigates to the Notifications dashboard.
- **Assertions**:
  - `expect(pageA.locator('.notification-list')).toContainText('User B accepted your roommate invitation');`

### Test 3: System sends booking confirmation notification
- **User**: `userC@example.com`
- **Logic**:
  1. Initialize standard `page` context.
  2. `userC@example.com` logs in and completes the property booking workflow.
  3. User navigates to their Notifications page.
- **Assertions**:
  - `expect(page.locator('.notification-list')).toContainText('Booking confirmed for');`

### Test 4: System sends payment received notification
- **User**: `userD@example.com`
- **Logic**:
  1. Initialize standard `page` context.
  2. `userD@example.com` logs in, navigates to Payments, and submits a rent payment.
  3. User navigates to their Notifications page.
- **Assertions**:
  - `expect(page.locator('.notification-list')).toContainText('Payment of');`
  - `expect(page.locator('.notification-list')).toContainText('received successfully');`

### Test 5: System sends reminder for uncompleted registration
- **User**: Admin (Sender), `userE@example.com` (Target - ONLY started registration)
- **Logic**:
  1. Initialize `adminContext` and `userEContext` using `browser.newContext()`.
  2. Admin logs in on `adminPage`, navigates to Pending Registrations, sees `userE@example.com`, and clicks "Send Reminder".
  3. User E logs in on `userEPage` (or checks email simulation/system notifications).
- **Assertions**:
  - Admin view: `expect(adminPage.locator('.toast-success')).toContainText('Reminder sent to userE@example.com');`
  - User E view: `expect(userEPage.locator('.notification-list')).toContainText('Please complete your registration');`

## Verification Method
- **Review**: Ensure no actual code is written (only design steps).
- **Test Integrity**: Check that Test 3 and Test 5 use distinct users (`userC` vs `userE`), and that `.serial` and `browser.newContext()` are explicitly defined.
