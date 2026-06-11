# Handoff: F2 Playwright Tests Fix Strategy

## 1. Observation
The previous iteration of the Playwright tests for 'Roommate Selection & Approval' (F2) failed the Reviewer gate.
Reviewer Feedback explicitly stated:
1. Test 3 does not verify the requirement 'leaving the room unlocked'. It only checks that the incoming request is hidden.
2. Test 2 does not verify that the room is locked for *both* users, which is explicitly requested.

## 2. Logic Chain
- To pass the Reviewer gate, the exact feedback must be addressed in the test assertions.
- For Test 3, verifying that the incoming request is hidden is insufficient; an explicit assertion verifying the 'unlocked' state is required. A reliable way to do this is checking a DOM element such as `data-testid="room-status"`.
- For Test 2, a single-user lock verification is insufficient. The test must simulate the context of the first user, assert the lock state, then simulate the login context of the second user and assert the lock state again.
- These specific adjustments need to be applied across the existing 5 test cases where applicable.
- E2E Testing Track rules require tests to be genuine failing tests based on the current implementation state, preventing any artificial passing or mock outputs.

## 3. Caveats
- Assumes the existence (or future implementation) of a UI indicator for the lock state, such as `data-testid="room-status"`.
- Assumes the worker is familiar with switching user contexts in Playwright (e.g., using multiple BrowserContexts or re-authenticating within the same flow).

## 4. Conclusion
The worker is advised to implement the following exact fixes to the existing 5 test cases:
- **Test 3:** Add an explicit assertion that the room state is 'unlocked' (e.g., `expect(page.getByTestId('room-status')).toHaveText('unlocked')`).
- **Test 2:** Add explicit assertions that check the room is locked for BOTH users. Verify the state for User A, then simulate login as User B (or use a secondary browser context) and verify the state again.
- **General Guidance:** Ensure all tests are genuine failing tests (E2E Testing Track). DO NOT fake outputs or force tests to pass artificially. Ensure these targeted fixes are integrated cleanly into the 5 existing test cases.

## 5. Verification Method
- Inspect the updated Playwright test files to confirm the presence of assertions for both users in Test 2 and the 'unlocked' status assertion in Test 3.
- Run the Playwright test suite (e.g., `npx playwright test`) and verify that it genuinely fails against the unimplemented frontend/backend, validating the robustness of the tests and absence of faked outputs.
