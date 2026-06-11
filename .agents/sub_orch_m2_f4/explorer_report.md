# Analysis & Design Report: F4 (Notifications) Boundary Tests

## 1. Observation
- **Project Goal**: A web application for managing employee registration, accommodation preferences, and room allocation (`PROJECT.md`).
- **Feature R4 (Notifications)**: The system must send automated notifications (or mock emails) for roommate invitations, booking confirmations, changes/cancellations, and reminders for uncompleted registrations (`ORIGINAL_REQUEST.md`).
- **Acceptance Criteria**: System logs or generates mock emails indicating successful notifications for key events.
- **Testing Approach**: E2E Tests using Playwright (`TEST_INFRA.md`). Standardized as Opaque-box, requirement-driven testing.

## 2. Logic Chain
- To design boundary and corner cases for F4 (Tier 2), we need to look beyond the "happy path" of simply sending a single notification.
- We must evaluate edge cases involving: timing (deadlines), duplication (spam or re-runs), concurrency (simultaneous actions), and input length boundaries.
- Boundary conditions exist at the exact transition point of deadlines and at the maximum bounds of input data.
- Corner cases exist where multiple asynchronous actions overlap (simultaneous requests) or redundant operations are performed (idempotency).

## 3. Caveats
- Since the backend implementation is ongoing, the exact notification log mechanism (e.g., a `.log` file, a database table, or intercepted console output) is assumed to be accessible in the E2E tests via an API (e.g., `/api/admin/mock-emails`) or filesystem.
- The tests assume that Playwright can either trigger internal cron jobs via API or mock the server time to trigger deadline reminders.

## 4. Conclusion: 5 Boundary & Corner Case Tests for Notifications

The following 5 test designs will be implemented in `tests/e2e/tier2_boundary/f4_notifications_boundary.spec.ts`:

### Test 1: Idempotency of Booking Confirmations (Duplicate Prevention)
**Scenario**: Admin triggers the auto-allocation process twice consecutively for the same event.
**Assert**: 
- Upon the first trigger, verify that newly allocated users receive a "booking confirmation" mock email.
- Upon the second trigger, verify that users who were already allocated do *not* receive a duplicate "booking confirmation" notification. 
**Endpoint/Logs**: Mock email logs (verify count of confirmations per user is exactly 1).

### Test 2: Simultaneous/Crossed Roommate Invitations
**Scenario**: User A and User B send roommate requests to each other at roughly the same time before either has accepted.
**Assert**: 
- Both "roommate invitation" notifications are logged.
- When User A accepts User B's invitation, a "booking confirmation / room locked" notification is generated.
- A redundant "invitation accepted" or conflicting "invitation cancelled" notification is NOT generated for the crossed request, ensuring the system resolves the circular reference gracefully.
**Endpoint/Logs**: Mock email logs, checking for the presence of exact confirmation messages and absence of crash/error logs.

### Test 3: Rapid State Changes (Invitation followed by immediate Cancellation)
**Scenario**: User A invites User B but cancels the request within milliseconds, before User B views the notification.
**Assert**:
- Verify the system logs both the "invitation" and a "cancellation" mock email, OR deduplicates the action entirely (depending on implementation).
- User B's dashboard must not show an active invitation.
**Endpoint/Logs**: Notification log endpoints. Ensure the final sequence of logs accurately represents the cancelled state.

### Test 4: Deadline Boundary Reminders
**Scenario**: A reminder for uncompleted registrations is scheduled to trigger at the registration deadline. An employee completes registration exactly 1 second before the deadline triggers.
**Assert**:
- The employee who just registered does *not* receive the reminder notification.
- Employees who remain unregistered at the exact deadline *do* receive the reminder.
**Endpoint/Logs**: Trigger the reminder endpoint (`/api/admin/reminders` or similar) and verify the mock email log recipients list.

### Test 5: Extremely Long User and Event Names (Payload Boundaries)
**Scenario**: An event is created with the maximum allowed character limit (e.g., 255 chars). A user with a very long name signs up and is invited to a room.
**Assert**:
- The mock email log is generated successfully without the notification formatting engine throwing an error or truncating required data unsafely.
- The logs contain the exact truncated or full strings as defined by the system's payload limits.
**Endpoint/Logs**: Read the raw notification logs and assert string matching for the long inputs.

## 5. Verification Method
- **Review**: The main agent or test implementer can review these 5 designs against the R4 requirements.
- **Execution**: To verify the behavior, the E2E tests will run via `npx playwright test tests/e2e/tier2_boundary/f4_notifications_boundary.spec.ts`.
- **Validation**: The test results will confirm if the actual notification system adheres to these boundary constraints.
