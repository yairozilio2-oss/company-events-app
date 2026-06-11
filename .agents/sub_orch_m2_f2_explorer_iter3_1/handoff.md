# Handoff: Strict Boundary & Corner Case Test Redesign (F2)

## 1. Observation
- In the previous iteration, E2E tests for the 5 boundary conditions of F2 (Roommate Selection & Approval) were written using "self-certifying" / "facade" patterns (`if` statements checking UI state, `Promise.any` for multiple possible outcomes).
- Playwright methods like `isVisible()` and `count()` were used immediately after actions, causing race conditions.
- The tests were designed to adapt to whatever the application did, rather than asserting a strict contract. This is an integrity violation, as it guarantees a test pass even if the feature behaves incorrectly or unpredictably.

## 2. Logic Chain
- To write robust, deterministic E2E tests, the test suite must define and enforce **exact, strict behaviors**. 
- Tests must use standard auto-waiting assertions (`await expect(locator).toX()`) rather than boolean evaluation.
- No `if/else` logic can be used to branch test expectations based on the DOM state.
- No `Promise.any` can be used to accept multiple differing valid states (e.g., expecting either a success or an error). 
- If the application currently does not meet the strict behavior outlined in the test, **the test should fail** until the product code is properly implemented to match the specification. E2E tests serve as the ultimate source of truth for application behavior.

## 3. Caveats
- By defining a single strict expectation for each boundary condition, the tests may initially fail if the frontend implementation currently handles these conditions differently (e.g., if it removes the button entirely instead of disabling it). The frontend developer must align the UI with these strict test assertions.

## 4. Conclusion
Below is the REDESIGN for the 5 Boundary & Corner Case tests. The implementer MUST follow these exact steps and strict assertions without conditional logic.

### Test 1: Prevent Self-Invitation
- **Scenario:** A user searches for their own email/name to invite themselves.
- **Strict Expectation:** The backend/frontend strictly filters out the logged-in user from the search results.
- **Strict Assertion:**
  1. Enter user's own email in `data-testid="roommate-search-input"`.
  2. Click `data-testid="search-submit-btn"`.
  3. `await expect(page.getByTestId('search-result-item').filter({ hasText: userEmail })).toHaveCount(0);`

### Test 2: Prevent Inviting an Already Locked User
- **Scenario:** A user searches for another user who has already finalized their room (Locked status).
- **Strict Expectation:** The user appears in the results, but the send request button is explicitly disabled.
- **Strict Assertion:**
  1. Search for a locked user's email.
  2. Click search.
  3. Locate the user's result item.
  4. `await expect(page.getByTestId('search-result-item').filter({ hasText: lockedUserEmail }).getByTestId('send-request-btn')).toBeDisabled();`

### Test 3: Auto-Cancellation of Pending Requests Upon Locking
- **Scenario:** User A has incoming requests from User B and User C. User A accepts User B's request.
- **Strict Expectation:** The room status updates to "Locked", and User C's request is automatically removed from the incoming requests list.
- **Strict Assertion:**
  1. Click `data-testid="accept-request-btn"` on User B's incoming request.
  2. `await expect(page.getByTestId('room-status-label')).toHaveText('Locked');`
  3. `await expect(page.getByTestId('incoming-request-item').filter({ hasText: userCEmail })).toHaveCount(0);`

### Test 4: Graceful Handling of Mutual Invitations
- **Scenario:** User A sends a request to User B. User B ignores the notification, searches for User A, and clicks send request.
- **Strict Expectation:** The system explicitly blocks the action with a toast error instead of forming the group (forcing the user to use the explicit 'Accept' button on the incoming request).
- **Strict Assertion:**
  1. User B searches for User A and clicks `data-testid="send-request-btn"`.
  2. `await expect(page.getByTestId('toast-error')).toBeVisible();`
  3. `await expect(page.getByTestId('toast-error')).toContainText(/already have an incoming request/i);`

### Test 5: Prevent Sending Requests Exceeding Room Capacity
- **Scenario:** Assuming a standard 2-person room limit (1 outgoing request allowed at a time). User A sends an invite to User B. User A then searches for User C to send another invite.
- **Strict Expectation:** The UI prevents sending multiple pending requests by disabling the send button on any further searches.
- **Strict Assertion:**
  1. User A sends request to User B (success).
  2. User A searches for User C.
  3. `await expect(page.getByTestId('search-result-item').filter({ hasText: userCEmail }).getByTestId('send-request-btn')).toBeDisabled();`

## 5. Verification Method
- Review `tests/e2e/tier2_boundary/f2_boundary.spec.ts` to confirm there are NO `if`, `else`, or `Promise.any` statements in the test assertions.
- Verify every assertion utilizes Playwright's `await expect(locator)...` auto-waiting matchers.
- Run `npx playwright test tests/e2e/tier2_boundary/f2_boundary.spec.ts` to ensure tests execute predictably (tests failing because the app doesn't match the strict spec is perfectly acceptable and expected; false passes are not).
