# Handoff: M1 Tier 1 E2E Tests Explorer

## 1. Observation
- `ORIGINAL_REQUEST.md` details four core functional requirements for the seminar management system:
  - **R1 (F1): Employee Portal** — Login, event viewing, setting preferences (arrival, kosher food, roommate request), and room status checking in an RTL interface.
  - **R2 (F2): Roommate Selection & Approval** — Bidirectional approval, room locking upon full acceptance, and strict gender separation.
  - **R3 (F3): Admin & Manager Portal** — Event creation, deadline management, auto-allocation for unassigned users, and occupancy report exporting.
  - **R4 (F4): Notifications** — Mock emails/logs for roommate invitations, confirmations, cancellations, and registration reminders.
- `TEST_INFRA.md` specifies building 5 Tier 1 (basic functional) tests per feature (total 20 tests).
- The designated output directory for the tests is `tests/e2e/tier1_feature/`.

## 2. Logic Chain
Based on the required 5 tests per feature, here is the detailed plan for the 20 Tier 1 E2E tests:

### Feature 1: Employee Registration & Preferences (`tests/e2e/tier1_feature/test_f1_employee_portal.spec.ts`)
1. **Login & Dashboard:** Employee logs in with valid credentials and verifies that active assigned events are displayed.
2. **Complete Registration Flow:** Employee successfully selects arrival preferences, dietary needs (e.g., kosher), and saves their registration.
3. **View Room Status:** Employee accesses the room status page and verifies it reflects their current unassigned or pending state accurately.
4. **Update Preferences:** Employee modifies previously saved preferences prior to the deadline and the system correctly records the update.
5. **RTL UI Validation:** UI structurally loads in RTL (Hebrew) format with proper responsive scaling on standard viewport sizes.

### Feature 2: Roommate Selection & Approval (`tests/e2e/tier1_feature/test_f2_roommate_selection.spec.ts`)
1. **Send Roommate Request:** Employee A navigates to the roommate section and successfully dispatches an invitation to Employee B.
2. **Accept Request:** Employee B receives the invitation and accepts it, updating both employees' statuses to mutually confirmed.
3. **Room Locking:** After all invited roommates (e.g., in a 2-person room) accept, the system correctly updates the room status to "Locked".
4. **Reject Request:** Employee B declines a request from Employee C, returning Employee C to an unassigned status and notifying them.
5. **Gender Separation:** System blocks Employee A from successfully inviting Employee D (who is of a different gender) to share a room.

### Feature 3: Admin & Manager Capabilities (`tests/e2e/tier1_feature/test_f3_admin_portal.spec.ts`)
1. **Create Event:** Admin accesses the dashboard and successfully creates a new event with specified dates and a registration deadline.
2. **Run Auto-Allocation:** Admin triggers the auto-allocation tool for employees who selected "don't care" or remain unassigned.
3. **Auto-Allocation Rules:** Following an auto-allocation run, the system validates that the resulting room assignments adhere to gender separation constraints.
4. **Export Occupancy Report:** Admin correctly generates and exports the room occupancy report for an event.
5. **Modify Deadline:** Admin updates the registration deadline for an existing event and the system enforces the new cutoff date.

### Feature 4: Notifications (Mock/Logs) (`tests/e2e/tier1_feature/test_f4_notifications.spec.ts`)
1. **Invitation Log:** Verify a notification/mock email is logged when Employee A sends a roommate request to Employee B.
2. **Confirmation Log:** Verify a confirmation notification is logged for Employee A when Employee B accepts the roommate request.
3. **Cancellation Log:** Verify a change/cancellation notification is logged when an employee alters a locked room booking.
4. **Reminder Log:** Simulate an expiring deadline and verify a reminder notification is logged for an employee who has not completed registration.
5. **Auto-Allocation Log:** Verify that users assigned rooms via admin auto-allocation receive a system notification regarding their new room.

## 3. Caveats
- Exact DOM selectors and test infrastructure setups (like login helpers, API interceptors for logs) are deferred to the implementation phase.
- Notification tests assume the ability to read a designated mock log file or intercept system events from the Playwright runner.

## 4. Conclusion
- The requirements encompass 4 core features, which have been mapped to exactly 20 distinct Tier 1 E2E tests covering the positive flows.
- The test suite is fully designed and ready to be implemented in `tests/e2e/tier1_feature/` utilizing Playwright.

## 5. Verification Method
- Inspect `tests/e2e/tier1_feature/` after implementation to ensure the 4 `.spec.ts` files contain the 20 structured tests described.
- Review Playwright test execution results (`npx playwright test tests/e2e/tier1_feature/`) to guarantee coverage matches the mapped Acceptance Criteria.
