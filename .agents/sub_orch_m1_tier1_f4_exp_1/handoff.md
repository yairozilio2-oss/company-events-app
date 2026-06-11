# Handoff Report: F4 Notifications Tier 1 Tests

## Observation
The requirement F4 mandates automated notifications for 5 specific events:
1. Roommate invitation sent.
2. Roommate invitation accepted.
3. Booking confirmation.
4. Registration cancellation.
5. Uncompleted registration reminder.
Target file: `tests/e2e/tier1_feature/f4_notifications.spec.ts`
The tests must be opaque-box, meaning they verify externally observable behaviors (e.g., mock email inbox, admin dashboard logs, or in-app notification center).

## Logic Chain
To maintain self-contained, Tier 1 happy-path tests, each test will simulate the user action that triggers the notification and then assert the notification's arrival.
1. **Roommate invitation sent**: Action - Primary user navigates to booking and invites a roommate. Assertion - Mock email/notification contains "invitation" targeted at the roommate's email.
2. **Roommate invitation accepted**: Action - Roommate user accepts the invitation (via mock link or portal). Assertion - Mock email/notification contains "accepted" targeted at the primary user's email.
3. **Booking confirmation**: Action - User completes payment/checkout. Assertion - Mock email contains "confirmation" for the booking.
4. **Registration cancellation**: Action - User cancels an existing booking. Assertion - Mock email contains "cancellation".
5. **Uncompleted registration reminder**: Action - User abandons flow; admin triggers reminders (or cron API is called). Assertion - Mock email contains "reminder".

## Test Designs (No implementation)

**Test 1: System sends roommate invitation notification**
*   **Logic**:
    1. Log in as `primary_user`.
    2. Navigate to the booking form.
    3. Enter `roommate_user@example.com` in the roommate field and submit the invitation.
*   **Assertions**:
    *   `await expect(mockEmailService.getLatestEmail('roommate_user@example.com')).resolves.toMatchObject({ subject: /Invitation to join/i });`

**Test 2: System sends roommate invitation accepted notification**
*   **Logic**:
    1. Assume `roommate_user` has a pending invitation.
    2. Log in as `roommate_user`.
    3. Navigate to pending invitations and click "Accept".
*   **Assertions**:
    *   `await expect(mockEmailService.getLatestEmail('primary_user@example.com')).resolves.toMatchObject({ subject: /Invitation Accepted/i });`

**Test 3: System sends booking confirmation notification**
*   **Logic**:
    1. Log in as a user.
    2. Complete a standard booking and submit payment.
    3. Wait for the success confirmation page.
*   **Assertions**:
    *   `await expect(mockEmailService.getLatestEmail('user@example.com')).resolves.toMatchObject({ subject: /Booking Confirmation/i });`

**Test 4: System sends registration cancellation notification**
*   **Logic**:
    1. Log in as a user with an active booking.
    2. Navigate to "My Bookings" and click "Cancel Booking".
    3. Confirm the cancellation.
*   **Assertions**:
    *   `await expect(mockEmailService.getLatestEmail('user@example.com')).resolves.toMatchObject({ subject: /Booking Cancelled/i });`

**Test 5: System sends reminder for uncompleted registration**
*   **Logic**:
    1. Log in as a user, start a booking, but do not complete it (abandon cart).
    2. Log in as an admin (or trigger the reminder endpoint/cron job via test runner).
    3. Trigger the "Send Reminders" action.
*   **Assertions**:
    *   `await expect(mockEmailService.getLatestEmail('user@example.com')).resolves.toMatchObject({ subject: /Complete your registration/i });`

## Caveats
- Playwright assertions assume the existence of a `mockEmailService` helper or a UI-based mock email viewer. The Implementer will need to adapt the `mockEmailService.getLatestEmail()` pseudo-code to the actual project mocking strategy (e.g., querying an API endpoint for an ethereal email service, or checking an internal notification center).
- Test 5 assumes an admin action or API trigger is available to simulate the passage of time or the trigger of the uncompleted registration reminder.

## Conclusion
5 distinct Tier 1 tests have been designed for F4 covering all required notification types. The tests follow standard opaque-box flows and provide pseudo-code assertions for verification.

## Verification Method
- An implementer agent can read this design and implement the code in `tests/e2e/tier1_feature/f4_notifications.spec.ts`.
- Once implemented, run `npx playwright test tests/e2e/tier1_feature/f4_notifications.spec.ts` to verify they pass against the application.
