# Handoff Report: F4 Notifications Test Design

## Observation
The Forensic Audit Report for `tests/e2e/tier1_feature/f4_notifications.spec.ts` found critical integrity violations:
1. **Facade implementation via conditional clicks**: Tests used `if (await element.isVisible())` to bypass missing elements without failing.
2. **Illogical multi-user flow**: Tests performed an action as User A (e.g., sending an invite) and then incorrectly asserted that User A's session received User B's notification.

## Logic Chain
To address these issues and create valid, opaque-box, requirement-driven tests for F4 (Notifications):
1. **Strict Assertions & Actions**: All UI interactions must assume the elements are present. If an element is absent, the test must naturally fail (Playwright's default behavior). No conditional `if` checks will be used for core test actions.
2. **True Multi-User Contexts**: To correctly verify notifications sent from one user to another, the tests must simulate two distinct sessions concurrently. We will use Playwright's `browser.newContext()` to create independent browser contexts (e.g., `senderContext` and `recipientContext`), allowing separate simultaneous logins.

Based on these principles, I have designed 5 distinct tests:
1. **System sends roommate invitation notification**: Sender invites Recipient. Recipient gets notification.
2. **System sends roommate invitation accepted notification**: Recipient accepts invite. Sender gets notification.
3. **System sends reminder for uncompleted registration**: Admin triggers reminder. User gets notification.
4. **System marks notification as read when clicked**: User clicks an unread notification, removing the unread badge.
5. **System displays empty state for no notifications**: A new user checks their inbox and sees a "No new notifications" message.

## Caveats
- The test logic assumes the presence of data-testids or stable text locators for notifications and buttons.
- The multi-user tests assume test accounts can be dynamically provisioned or reliably reused without interference.

## Conclusion

### Test 1: System sends roommate invitation notification
**Logic:**
1. Create `senderContext` and `recipientContext`.
2. Login User A on `senderContext`. Login User B on `recipientContext`.
3. User A navigates to `/invite`, fills User B's email, and clicks `getByTestId('send-invite-btn')` (without conditional checks).
4. User B navigates to `/notifications`.
**Assertions:**
- `expect(recipientPage.getByText('You have been invited by User A')).toBeVisible()`

### Test 2: System sends roommate invitation accepted notification
**Logic:**
1. Create `senderContext` and `recipientContext`.
2. Login User A (sender) and User B (recipient).
3. User B views their invitations and clicks `getByTestId('accept-invite-btn')`.
4. User A navigates to `/notifications`.
**Assertions:**
- `expect(senderPage.getByText('User B has accepted your invitation')).toBeVisible()`

### Test 3: System sends reminder for uncompleted registration
**Logic:**
1. Create `adminContext` and `userContext`.
2. Login Admin and incomplete User.
3. Admin navigates to `/admin/users`, selects User, and clicks `getByTestId('send-reminder-btn')`.
4. User navigates to `/notifications`.
**Assertions:**
- `expect(userPage.getByText('Complete your registration')).toBeVisible()`

### Test 4: System marks notification as read when user clicks it
**Logic:**
1. Create a `userContext` and login.
2. Navigate to `/notifications` where an unread notification exists.
3. Click on the unread notification `getByTestId('notification-item-unread')`.
4. Return to the notifications list or check the notification state.
**Assertions:**
- `expect(userPage.getByTestId('notification-item-unread')).toHaveCount(0)` (or verify the item is now marked as read).

### Test 5: System displays empty state when there are no notifications
**Logic:**
1. Create a `newContext` and login as a brand new user with no history.
2. Navigate to `/notifications`.
**Assertions:**
- `expect(userPage.getByText('No notifications')).toBeVisible()`
- `expect(userPage.getByTestId('notification-list')).toBeEmpty()` (or equivalent assertion based on implementation).

## Verification Method
To independently verify this design:
1. Review the generated `tests/e2e/tier1_feature/f4_notifications.spec.ts`.
2. Ensure there are exactly 5 tests.
3. Ensure the test code directly calls `.click()` and `.fill()` without `if (isVisible)` wrapper logic.
4. Verify that `browser.newContext()` is utilized for the first three multi-user tests.
