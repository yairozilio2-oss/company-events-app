# F4 Notifications Test Design Handoff

## 1. Observation
The Gen 3 Forensic Auditor report identified two critical Integrity Violations in the previous test suite for Feature 4 (Notifications):
- **Illogical multi-user checks**: The test failed to explicitly register or set up User D before attempting to cancel a booking, and failed to initiate a pending registration for User E before sending a reminder.
- **Facade implementation**: The previous test asserted against a UI page route (`/notifications`) which does not exist in the F4 requirements. Notifications are strictly mock/log based.

## 2. Logic Chain
To address these findings, the new test design incorporates the following principles:
- **Setup Completeness**: Every test must encompass the full lifecycle needed to trigger the notification. For example, Test 4 will explicitly execute registration, login, and booking creation for User D *before* attempting the cancellation.
- **Mock/Log Assertions**: Instead of navigating to a `/notifications` UI page, assertions will involve reading from a mock email log (e.g., parsing a local file or checking a mocked backend API endpoint) to verify that an email was triggered by the action.
- **Strict Isolation**: `test.describe.serial` will be utilized, and each test will use a fresh `browser.newContext()` to ensure clean cookies and session data.

### Test Design Details

**Test 1: Registration Welcome Notification**
- **Logic**: Navigate to `/register`. Register User A.
- **Assertion**: Use Node.js `fs` to read the mock email log (e.g., `mock_emails.log`) and assert it contains a "Welcome" or "Registration Successful" message addressed to User A's email.

**Test 2: Booking Confirmation Notification**
- **Logic**: Navigate to `/register`. Register User B. Log in. Book a room.
- **Assertion**: Read the mock email log and assert it contains a "Booking Confirmed" message addressed to User B's email, including the booking details.

**Test 3: Password Reset Notification**
- **Logic**: Navigate to `/register`. Register User C. Navigate to `/forgot-password`. Request a reset link for User C.
- **Assertion**: Read the mock email log and assert it contains a "Password Reset" message addressed to User C's email.

**Test 4: Booking Cancellation Notification**
- **Logic**: 
  - *Setup*: Navigate to `/register` and register User D. Log in. Book a room for User D. 
  - *Action*: Navigate to User D's bookings page and cancel the booking.
- **Assertion**: Read the mock email log and assert it contains a "Booking Cancelled" message addressed to User D's email.

**Test 5: Pending Registration Reminder**
- **Logic**: 
  - *Setup*: Navigate to `/register`. Start registration for User E by filling out partial information (or hitting a specific API to mock an abandoned registration). 
  - *Action*: Admin logs in, navigates to the admin dashboard, and clicks "Send Reminder" for User E's pending registration.
- **Assertion**: Read the mock email log and assert it contains a "Registration Reminder" message addressed to User E's email.

## 3. Caveats
- The exact implementation of the mock/log notification system depends on the project's backend setup (e.g., reading a local file like `backend/mock_emails.log`, or calling an internal test API like `GET /__test/emails`). The implementer must determine the specific Node.js API or Playwright request needed to verify the mock state.
- Test 5 assumes an admin interface exists for sending reminders to abandoned registrations.

## 4. Conclusion
The 5 newly designed Tier 1 tests for F4 Notifications satisfy all constraints from the Gen 3 Forensic Auditor. They enforce complete state setup within individual tests and correctly assert against backend logs/mocks rather than non-existent frontend UI routes.

## 5. Verification Method
The implementer should write the test code and run `npx playwright test tests/e2e/tier1_feature/f4_notifications.spec.ts`.
A successful run will prove that the tests pass against the mock email infrastructure without producing 'element not found' errors on non-existent `/notifications` pages.
