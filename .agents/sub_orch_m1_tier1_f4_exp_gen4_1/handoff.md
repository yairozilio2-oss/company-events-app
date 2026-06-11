# Handoff Report: F4 Notifications Test Design

## Observation
- The previous test implementation for F4 failed the forensic audit due to:
  1. Illogical multi-user checks: Tests 4 and 5 relied on users (User D and User E) and states (bookings/pending registrations) that were never created within the test context.
  2. Facade implementation: The test checked a `/notifications` UI route that does not exist in the frontend codebase.
- The feature requirements specify that F4 is "Mock/Log based".

## Logic Chain
To address the audit failures, the test design has been updated to be fully self-contained and use log-based assertions instead of UI-based ones:

1. **Test 1: Registration Confirmation Notification**
   - **Setup:** Initialize a new context for User A.
   - **Action:** User A completes the registration form and submits.
   - **Assertion:** Use `fs.readFileSync('mock_emails.log')` and assert it contains a registration confirmation email sent to User A's email address.

2. **Test 2: Booking Confirmation Notification**
   - **Setup:** Initialize a new context. Register User B.
   - **Action:** User B logs in and books a room.
   - **Assertion:** Read `mock_emails.log` and assert it contains a booking confirmation email sent to User B.

3. **Test 3: Admin Cancellation Notification**
   - **Setup:** Initialize a new context. Register User C and book a room.
   - **Action:** Admin logs in, navigates to the admin panel, and cancels User C's booking.
   - **Assertion:** Read `mock_emails.log` and assert it contains a cancellation email sent to User C.

4. **Test 4: User Cancellation Notification**
   - **Setup:** Initialize a new context. **Crucial:** Register User D, log in, and book a room. (This explicit setup fixes the previous audit failure).
   - **Action:** User D navigates to their user dashboard and cancels the booking.
   - **Assertion:** Read `mock_emails.log` and assert it contains a cancellation email sent to User D.

5. **Test 5: Admin Pending Reminder Notification**
   - **Setup:** Initialize a new context. **Crucial:** Create a pending registration state for User E (e.g., via API call or partial form submission).
   - **Action:** Admin logs in, navigates to pending registrations, and triggers a 'Send Reminder' action for User E.
   - **Assertion:** Read `mock_emails.log` and assert it contains a registration reminder email sent to User E.

**Playwright Assertion Strategy:**
All tests will use `test.describe.serial` and `browser.newContext()` for isolation.
Instead of `page.goto('/notifications')`, the tests will use Node's `fs` module to check backend logs:
```typescript
import fs from 'fs';
// inside test after action
await page.waitForTimeout(1000); // Wait for async log writing
const logContent = fs.readFileSync('mock_emails.log', 'utf8');
expect(logContent).toContain('To: userD@example.com');
expect(logContent).toContain('Subject: Booking Cancelled');
```

## Caveats
- The exact path to `mock_emails.log` needs to be verified during implementation.
- The exact mechanism to create a "pending" registration (Test 5) depends on the backend implementation.

## Conclusion
The revised design provides 5 self-contained, isolated Tier 1 tests for the F4 Notifications feature. By explicitly creating prerequisite state within Tests 4 and 5, and replacing non-existent UI route assertions with backend log file verifications, the design directly resolves the previous integrity violations.

## Verification Method
- **Implementer:** Write the tests based on this design in `tests/e2e/tier1_feature/f4_notifications.spec.ts`.
- **Validation:** Run `npx playwright test tests/e2e/tier1_feature/f4_notifications.spec.ts` to ensure the tests pass, operate in isolation, and do not rely on the `/notifications` route.
