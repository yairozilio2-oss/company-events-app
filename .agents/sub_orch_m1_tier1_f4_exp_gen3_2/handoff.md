# Handoff Report: F4 (Notifications) Tier 1 Feature Tests Design

## 1. Observation
The previous test suite failed the forensic audit due to integrity violations:
- Sequential flow tests (Test 1 and Test 2) were split across independent tests without enforcing execution order, causing state conflicts because Playwright runs tests in parallel by default.
- State mutation conflicts occurred when Test 3 fully booked `userC@example.com`, but Test 5 expected `userC@example.com` to be pending.
- There was an absence of `test.describe.serial` or strict isolation to handle these inter-test dependencies.

## 2. Logic Chain
To resolve the auditor's findings while meeting the F4 feature test requirements, the new design incorporates the following:
- **Execution Strategy:** The test suite will be wrapped in `test.describe.serial('F4 Notifications', () => { ... })` to ensure sequential execution. This guarantees that Test 1 runs before Test 2, safely persisting the database state (User A inviting User B).
- **Data Segregation:** Each test involving different states uses entirely unique test data/users to avoid state collisions.
  - Test 1 & 2: `userA@example.com` and `userB@example.com` (Invitation flow).
  - Test 3: `userC@example.com` (Successful booking flow).
  - Test 4: `userD@example.com` (Payment notification flow).
  - Test 5: `userE@example.com` (Uncompleted registration / pending flow).
- **Context Isolation:** Multi-user interactions within tests will use explicit `browser.newContext()` calls to ensure no shared session data between actors (e.g., User A sending and User B receiving).

## 3. Caveats
- This is a design specification; the implementation will need to provide the actual mock backend endpoints or database seeding commands to ensure the initial state is correct before execution.
- Depending on the backend configuration, Test 5 might require an administrative endpoint or mocked chron-job trigger to send the reminder.

## 4. Conclusion
### Proposed Test Designs for F4 (Notifications):

**Suite Definition:** `test.describe.serial('F4: Notifications Tier 1 Tests', () => { ... })`

**Test 1: System sends roommate invitation notification**
- **Logic:** Create a new browser context. User A (`userA@example.com`) logs in, navigates to the "Roommates" section, enters `userB@example.com`, and clicks "Send Invite".
- **Assertions:** `expect(page.getByText('Invitation sent successfully')).toBeVisible()`.

**Test 2: System sends roommate invitation accepted notification**
- **Logic:** Create a new browser context. User B (`userB@example.com`) logs in, goes to "Invitations", and clicks "Accept" on the invite from User A. Then, create another new context for User A, log in, and check the "Notifications" panel.
- **Assertions:** `expect(page.getByText('User B accepted your invitation')).toBeVisible()` in User A's notification feed.

**Test 3: System sends booking confirmation notification**
- **Logic:** User C (`userC@example.com`) logs in and completes a property booking flow. Navigate to the notifications center.
- **Assertions:** `expect(page.getByText('Booking confirmed')).toBeVisible()` and verify the notification contains the correct property details.

**Test 4: System sends payment receipt notification**
- **Logic:** User D (`userD@example.com`) logs in, navigates to "Payments", and completes a transaction for an outstanding balance.
- **Assertions:** `expect(page.getByText('Payment receipt')).toBeVisible()` in the user's notifications or recent emails panel, matching the paid amount.

**Test 5: System sends reminder for uncompleted registration**
- **Logic:** Admin user logs in, goes to the "Registrations" dashboard, filters by "Pending", finds User E (`userE@example.com` - who was seeded as incomplete and is entirely distinct from User C), and triggers the "Send Reminder" action.
- **Assertions:** `expect(page.getByText('Reminder sent to userE@example.com')).toBeVisible()`. (Optionally, log in as User E in a new context and verify the reminder notification).

## 5. Verification Method
1. The implementer should write the tests precisely following this design.
2. Run `npx playwright test tests/e2e/tier1_feature/f4_notifications.spec.ts`.
3. Verify that `test.describe.serial` is declared at the top level.
4. Check that `userC@example.com` is strictly used in Test 3, and `userE@example.com` is strictly used in Test 5 to validate state integrity.
5. Inspect context instantiations to ensure multi-user isolation.
