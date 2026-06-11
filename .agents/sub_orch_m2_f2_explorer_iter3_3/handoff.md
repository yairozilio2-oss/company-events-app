# Handoff: F2 Boundary & Corner Case Tests Redesign

## 1. Observation
Based on the auditor and reviewer reports, the previous implementation of the 5 boundary tests for F2 (Roommate Selection & Approval) failed because of "facade testing" and Playwright anti-patterns. 
Specifically, the tests used:
- Conditional logic (`if (await locator.isVisible())`, `if (await locator.isDisabled())`) to dynamically bypass assertions and ensure a pass.
- `Promise.any()` to accept either success or error messages, avoiding strict verification.
- Immediate state checks (`isVisible()`, `count()`) instead of Playwright's auto-waiting assertions (`expect().toBeVisible()`), causing race conditions and false positives.

## 2. Logic Chain
To correct this and restore test integrity, the tests must enforce a single, deterministic, explicitly expected behavior for each boundary case. Test suites are meant to fail if the product does not match the exact requirements. By strictly defining the expected outcomes, we ensure the tests hold the application to a high standard.
- Any branching (`if`/`else`) logic will be removed.
- All state verifications will use auto-waiting expectations (e.g., `await expect(locator).toBeDisabled()`, `await expect(locator).toHaveCount(n)`).
- If the current application code does not meet these strict criteria, the test will correctly fail until the product code is fixed.

## 3. Caveats
- The exact `data-testid` attributes used in the redesign are illustrative. The implementer must match them to the actual attributes in the codebase.
- Because these tests are strict, they will fail if the underlying application behavior is partially implemented or behaves differently than prescribed. This is an intentional feature of robust E2E testing.

## 4. Conclusion
The 5 boundary and corner case tests are completely redesigned with strict, linear steps and deterministic assertions:

### Test 1: Prevent Self-Invitation
- **Step 1:** Log in as User A. Navigate to the Search page.
- **Step 2:** Search for User A's own email.
- **Step 3:** Wait for the search results to populate (`await expect(page.getByTestId('search-result-item')).toBeVisible()`).
- **Step 4:** **Strict Assertion:** Verify that the "Send Request" button on User A's profile card is explicitly disabled. 
  - `await expect(page.getByTestId('send-request-btn')).toBeDisabled();`

### Test 2: Prevent Inviting an Already Locked User
- **Step 1:** Setup: User B is already matched with a roommate in the database (Locked).
- **Step 2:** Log in as User A. Search for User B.
- **Step 3:** Wait for the search results to populate.
- **Step 4:** **Strict Assertion:** Verify that the "Send Request" button on User B's profile is explicitly disabled.
  - `await expect(page.getByTestId('send-request-btn')).toBeDisabled();`

### Test 3: Cancellation of Pending Outgoing Requests Upon Match
- **Step 1:** Setup: User A has an active outgoing request to User B. User A then accepts an incoming request from User C, becoming locked/matched.
- **Step 2:** Log in as User A and navigate to the "Outgoing Requests" view.
- **Step 3:** **Strict Assertion:** Verify that the outgoing requests list is completely empty. The previous pending request must no longer be present.
  - `await expect(page.getByTestId('outgoing-request-item')).toHaveCount(0);`

### Test 4: Graceful Handling of Mutual Invitations
- **Step 1:** Setup: User A has sent a pending request to User B.
- **Step 2:** Log in as User B. Navigate to Search and search for User A.
- **Step 3:** Wait for results. Click the "Send Request" button on User A's card.
- **Step 4:** **Strict Assertion:** The system must treat this mutual invitation as an acceptance. Verify that a success message is shown and the user's status updates to Matched.
  - `await expect(page.getByTestId('toast-success')).toBeVisible();`
  - `await expect(page.getByTestId('match-status')).toHaveText('Matched');`

### Test 5: Prevent Sending Requests Exceeding Room Capacity
- **Step 1:** Setup: User A has reached the maximum allowed outgoing pending requests (e.g., 1 request sent).
- **Step 2:** Log in as User A. Navigate to Search and search for User C.
- **Step 3:** Wait for results and click "Send Request" on User C's card.
- **Step 4:** **Strict Assertion:** The system must explicitly reject the request. Verify an error toast appears.
  - `await expect(page.getByTestId('toast-error')).toBeVisible();`
  - `await expect(page.getByTestId('toast-error')).toContainText('limit');`

## 5. Verification Method
- Inspect the newly implemented `tests/e2e/tier2_boundary/f2_boundary.spec.ts`.
- Verify the complete absence of `if`/`else` branches.
- Verify the complete absence of `Promise.any()`.
- Verify the complete absence of immediate state checks (`isVisible()`, `count()`) used outside of `expect()` matchers.
- Run `npx playwright test tests/e2e/tier2_boundary/f2_boundary.spec.ts` to ensure the tests execute linearly and enforce these specific behaviors.
