# Handoff: F2 (Roommate Selection & Approval) Test Fix Strategy

## Observation
The previous iteration of the Playwright tests for 'Roommate Selection & Approval' (F2) failed the Reviewer gate. The reviewer feedback explicitly stated:
1. "Test 3 does not verify the requirement 'leaving the room unlocked'. It only checks that the incoming request is hidden."
2. "Test 2 does not verify that the room is locked for *both* users, which is explicitly requested."

## Logic Chain
1. To address Feedback #1, Test 3 must do more than verify UI visibility (e.g., hidden incoming request). It needs an explicit assertion verifying the core domain state: that the room remains 'unlocked'. A reliable way to do this in E2E tests is asserting on a state indicator like `data-testid="room-status"`.
2. To address Feedback #2, Test 2 must simulate the multi-user scenario completely. It is not enough to check the lock status for the acting user. The test must: check the locked state for User 1, then simulate a login (or switch browser contexts) to User 2, and explicitly check that the room is locked for User 2 as well.
3. As this falls under the E2E Testing Track, tests must be genuine. Writing tests that immediately pass by faking outputs or using placeholder assertions defeats the purpose of test-driven development and will fail the gate.

## Caveats
- The exact DOM selector `data-testid="room-status"` is a recommendation. The implementer must adjust it if the actual UI component uses a different accessible name or test ID to display room status.

## Conclusion
The implementer must apply exact fixes to the existing 5 test cases:
- **Test 2:** Add explicit assertions checking that the room is locked for *both* users. Verify the state for the first user, log in as the second user (or use a separate `browserContext`), and verify the locked state again.
- **Test 3:** Add an explicit assertion checking that the room state is 'unlocked' (e.g., `expect(page.getByTestId('room-status')).toHaveText(/unlocked/i)`).
- **CRITICAL REMINDER:** Write *genuine* failing tests (E2E Testing Track). Do NOT mock or fake outputs. The tests should fail organically until the backend/frontend logic for F2 is properly implemented.

## Verification Method
1. Inspect the updated test file for the 5 test cases to ensure the specific assertions for Test 2 (dual-context checks) and Test 3 (unlocked state check) are present.
2. Run the Playwright test suite using the project's test command (e.g., `npx playwright test`).
3. Verify that the tests legitimately fail due to missing application implementation (verifying they are genuine E2E tests), not due to syntax errors or faked passing assertions.
