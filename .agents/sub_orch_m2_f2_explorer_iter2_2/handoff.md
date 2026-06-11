# F2 Roommate Selection & Approval: Boundary & Corner Case Test Design

## Observation
I investigated the existing end-to-end tests for the "Roommate Selection & Approval" feature located in `tests/e2e/tier1_feature/f2_roommate.spec.ts`. The basic "happy paths" are already covered:
- Sending a request to a same-gender employee.
- Accepting a request (which locks the room).
- Declining a request.
- Canceling an outgoing request.
- Enforcing gender separation (preventing cross-gender requests).

The application relies on Playwright and uses standardized `data-testid` attributes such as `roommate-search-input`, `search-submit-btn`, `search-result-item`, `send-request-btn`, `incoming-request-item`, `accept-request-btn`, `toast-success`, `toast-error`, and `room-status-label`. 

According to `SCOPE.md`, 5 Boundary/Corner Case tests must be defined and placed in `tests/e2e/tier2_boundary/`.

## Logic Chain
To provide comprehensive boundary and corner-case coverage, we must test the system's behavior when it reaches state limits or encounters race conditions. The 5 designed tests focus on these constraints:

1. **Self-Request Boundary (Identity Boundary):** A user cannot send a roommate request to themselves. 
   - *Action:* The logged-in user searches for their own name.
   - *Expected:* The user should either not appear in the `search-result-item` list, or the `send-request-btn` should be disabled/absent, preventing self-selection.

2. **Unavailable Target Boundary (State Boundary - Target):** A user cannot send a request to someone who has already locked their room with another roommate.
   - *Action:* User searches for an employee whose room status is already 'Locked'.
   - *Expected:* The target employee either doesn't appear in the search results, or clicking the `send-request-btn` yields a `toast-error` (e.g., "User is no longer available" or "Room is already locked").

3. **Double Acceptance Boundary (State Boundary - Actor):** A user with multiple pending incoming requests should not be able to accept a second request after they have already accepted one (and locked their room).
   - *Action:* User navigates to `/roommates/requests` and has two `incoming-request-item` elements. They click `accept-request-btn` on the first one. Then, they attempt to click `accept-request-btn` on the second one.
   - *Expected:* The second click should not succeed. The button should either disappear/be disabled upon the first acceptance, or the system should present a `toast-error` stating "Room already locked".

4. **Stale Request / Race Condition (Concurrency Corner Case):** A user attempts to accept a request that the sender just cancelled.
   - *Action:* Simulating a stale UI. User A receives a request from User B. Behind the scenes (or via API / second browser context), User B cancels the request. User A then clicks `accept-request-btn` on the now-stale incoming request in their UI.
   - *Expected:* The system rejects the action, displaying a `toast-error` (e.g., "Request is no longer valid" or "Request was cancelled").

5. **Mutual/Reciprocal Request Collision (Collision Corner Case):** User A sends a request to User B. Before B responds, User B independently searches for User A and attempts to send a request to them.
   - *Action:* User B searches for User A and clicks `send-request-btn`. 
   - *Expected:* The system should prevent the creation of a duplicate/reciprocal request. It should display a `toast-error` informing User B to check their incoming requests, or it should auto-accept the match.

## Caveats
- The exact error messages in the `toast-error` components might differ based on backend implementation. The worker implementing the tests should adjust the text assertions to match the actual API/UI responses.
- Simulating the "Stale Request" (Test 4) might require Playwright's `browser.newContext()` to simulate two active users simultaneously, or direct API mocking if backend integration is not fully ready.
- The UI behavior for unavailable users (filtered out vs. disabled buttons) is assumed to fall into one of the tested expected paths; the worker should assert based on the specific frontend implementation.

## Conclusion
The 5 boundary and corner case tests have been fully designed to cover identity limits, state limits, concurrency issues, and reciprocal collisions for the Roommate Selection & Approval feature. The test design relies on the established `data-testid` locator patterns and Playwright practices.

## Verification Method
The subsequent implementer agent should create `tests/e2e/tier2_boundary/f2_roommate_boundary.spec.ts` using these exact 5 test cases.
To verify, run:
`npx playwright test tests/e2e/tier2_boundary/f2_roommate_boundary.spec.ts`
The tests should pass, confirming that the boundary and corner cases are handled gracefully by the application.
