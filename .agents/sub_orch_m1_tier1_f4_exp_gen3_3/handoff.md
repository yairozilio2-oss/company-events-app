# Handoff Report: F4 (Notifications) Tier 1 Feature Tests Design

## 1. Observation
- Read the auditor's report which detailed the integrity violations.
- Previously, tests were executing in parallel without isolation, leading to shared state failures between Test 1 and Test 2 (Roommate invitation flow).
- Additionally, Test 3 and Test 5 had a state conflict because Test 3 completed the booking for `userC@example.com`, while Test 5 expected that same user to be in a pending state for a reminder.

## 2. Logic Chain
- **Sequential Execution**: To resolve parallel execution issues for dependent tests, I grouped the roommate invitation tests into a `test.describe.serial('Roommate Invitation Flow')` block. Test 1 will initiate the invite from User A to User B, and Test 2 will have User B accept it.
- **Multi-user Isolation**: Within the multi-user tests, `browser.newContext()` is used to instantiate isolated browser sessions for User A and User B concurrently, preventing session bleeding.
- **State Conflict Avoidance**: To resolve the user state conflicts, I assigned strictly unique users for each independent test scenario:
  - Test 3 uses `userC@example.com` for a completed booking.
  - Test 4 uses `userD@example.com` for a payment receipt.
  - Test 5 uses `userE@example.com` specifically for the uncompleted registration scenario, ensuring `userE` remains pending and untouched by Test 3.

## 3. Caveats
- This design assumes Playwright will respect the `.serial` modifier to ensure Test 2 strictly runs after Test 1 completes successfully.
- It assumes user accounts can be dynamically created or are pre-seeded in a way that allows using distinct emails like `userA` through `userE`.

## 4. Conclusion
Designed 5 self-contained and conflict-free Tier 1 tests:

- **test.describe.serial('Roommate Invitation Flow', () => {**
  - **Test 1: System sends roommate invitation notification**
    - *Logic*: User A logs in, navigates to roommates, and invites User B.
    - *Assertion*: Open a new context for User B. User B logs in, checks notifications, and sees the invitation from User A.
  - **Test 2: System sends roommate invitation accepted notification**
    - *Logic*: Relying on Test 1, User B accepts the invitation in their notification panel.
    - *Assertion*: Switch back to User A's context. User A checks notifications and asserts that a "User B accepted your invitation" notification exists.
- **})**

- **Test 3: System sends booking confirmation notification**
  - *Logic*: `userC@example.com` logs in and successfully completes a full booking flow.
  - *Assertion*: User C checks their notification panel and verifies that a "Booking Confirmed" notification is present.

- **Test 4: System sends payment receipt notification**
  - *Logic*: `userD@example.com` logs in and completes a payment transaction for an upcoming installment.
  - *Assertion*: User D checks their notification panel and verifies that a "Payment Receipt" notification is present.

- **Test 5: System sends reminder for uncompleted registration**
  - *Logic*: `userE@example.com` initiates registration but abandons it midway. Admin logs in, views the pending registrations list, locates `userE@example.com`, and clicks "Send Reminder".
  - *Assertion*: `userE@example.com` logs in, accesses notifications, and asserts the presence of a "Complete your registration" reminder.

## 5. Verification Method
- **Command**: `npx playwright test tests/e2e/tier1_feature/f4_notifications.spec.ts`
- **Validation**: Verify that the tests pass sequentially and independently. Ensure no state conflicts occur between `userC` and `userE`, and that multi-user contexts properly isolate User A and User B.
