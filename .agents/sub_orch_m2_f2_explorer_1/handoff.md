# Handoff Report: F2 Boundary Tests Design

## Observation
- The F2 feature is "Roommate Selection & Approval".
- Tier 1 feature tests (`f2_roommate.spec.ts`) exercise basic flows: sending a request (same gender), accepting a request (locking room), declining, canceling, and gender separation.
- UI elements are interacted with via `data-testid`: `roommate-search-input`, `search-submit-btn`, `search-result-item`, `send-request-btn`, `accept-request-btn`, `decline-request-btn`, `toast-error`, `toast-success`, `room-status-label`, etc.
- Routes used are `/roommates`, `/roommates/requests` (incoming), and `/roommates/outgoing`.

## Logic Chain
- Tier 2 tests must focus on boundaries and corner cases (BVA and State transitions).
- The primary state transitions involve request states (none -> pending -> accepted/locked or declined) and user room states (unlocked -> locked).
- Boundary cases occur when interacting with entities that violate state preconditions:
  1. **Self-Interaction**: Source equals target.
  2. **Duplicate State**: Action on an already existing pending state.
  3. **Locked Target**: Sending a request to a user whose room is already locked.
  4. **Stale Request**: Attempting to accept a request from a user whose room became locked after the request was sent.
  5. **Cross-Invite**: Sending a request to a user who already sent you a request.

## Caveats
- Exact application behavior for some edge cases (e.g., mutual invites) is not strictly defined in `TEST_INFRA.md`, so tests should verify the system handles them gracefully (either preventing the action or auto-matching), guided by error toasts (`toast-error`).
- Data setup will require specific mock users in different states (locked, pending).

## Conclusion
Here is the design for the 5 Tier 2 Boundary Tests to be implemented in `tests/e2e/tier2_boundary/f2_boundary.spec.ts`:

1. **Test: Cannot send a roommate request to oneself**
   - **Precondition**: User is logged in.
   - **Steps**: Go to `/roommates`. Search for the logged-in user's own name.
   - **Expected**: The search result either does not display the user, or the `send-request-btn` is disabled/hidden. If clickable, it must show a `toast-error`.

2. **Test: Cannot send multiple concurrent requests to the same employee**
   - **Precondition**: User has already sent a request to Employee X (pending).
   - **Steps**: Go to `/roommates`. Search for Employee X. Attempt to send another request.
   - **Expected**: The `send-request-btn` should be disabled, or clicking it should trigger a `toast-error` (e.g., "Request already pending").

3. **Test: Cannot send a request to an employee who already has a roommate (Locked)**
   - **Precondition**: Employee Y already has a locked room.
   - **Steps**: Go to `/roommates`. Search for Employee Y.
   - **Expected**: Employee Y is either excluded from search results, or the `send-request-btn` is disabled/shows a `toast-error` indicating the user is unavailable.

4. **Test: Cannot accept a pending request if the sender has since locked their room**
   - **Precondition**: User A sent a request to User B. Afterwards, User A accepted a request from User C (User A is now locked).
   - **Steps**: User B logs in, goes to `/roommates/requests`. Finds the request from User A and clicks `accept-request-btn`.
   - **Expected**: Action fails with a `toast-error` (e.g., "Sender already has a roommate"), and User B's room remains 'Unlocked'.

5. **Test: Cross-invitation gracefully resolves or is prevented**
   - **Precondition**: User A has a pending request sent to User B.
   - **Steps**: User B goes to `/roommates`, searches for User A, and clicks `send-request-btn` instead of going to incoming requests.
   - **Expected**: The system should either auto-accept the mutual request (toast-success "Roommate request accepted") or show a `toast-error` indicating a request from User A is already waiting.

## Verification Method
- **Implementation**: A worker agent should implement these 5 tests in `tests/e2e/tier2_boundary/f2_boundary.spec.ts`.
- **Validation**: Run the tests using the project's test command (e.g., `npx playwright test tests/e2e/tier2_boundary/f2_boundary.spec.ts`).
- **Condition**: All 5 tests must pass against the application, proving the edge cases are handled correctly.
