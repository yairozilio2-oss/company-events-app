# Fix Strategy & Handoff Report: F2 Roommate Selection & Approval

## Fix Strategy

The previous iteration of the Playwright tests for 'Roommate Selection & Approval' (F2) failed the Reviewer gate. The worker is advised to implement the following exact fixes to the existing 5 test cases to directly address the reviewer's feedback:

1. **Test 3 (Room Unlocked Check)**: 
   - **Feedback**: "Test 3 does not verify the requirement 'leaving the room unlocked'. It only checks that the incoming request is hidden."
   - **Action**: Add an explicit assertion in Test 3 that verifies the room state is 'unlocked'. You should do this by checking a specific element indicating the status, such as checking for `data-testid="room-status"` to have the text or value corresponding to unlocked.

2. **Test 2 (Room Locked for Both Users Check)**:
   - **Feedback**: "Test 2 does not verify that the room is locked for *both* users, which is explicitly requested."
   - **Action**: Add explicit assertions in Test 2 that verify the room is locked for BOTH users. First, verify the state for the current user. Then, simulate a login as the other user involved in the request and verify the locked state again for that second user.

**Important Reminder to Worker:**
You must write *genuine* failing tests for the E2E Testing Track. Do NOT fake outputs or mock the system state artificially to pass the test runner. Implement these modifications properly within the Playwright test environment.

---

## Handoff Report

### 1. Observation
- The Reviewer gate returned `REQUEST_CHANGES` for the F2 test suite.
- Exact feedback provided:
  - "1. Test 3 does not verify the requirement 'leaving the room unlocked'. It only checks that the incoming request is hidden."
  - "2. Test 2 does not verify that the room is locked for *both* users, which is explicitly requested."

### 2. Logic Chain
- The tests currently verify UI artifacts (like a hidden request) but fail to assert the underlying domain state required by the acceptance criteria (unlocked vs locked room states).
- To pass the gate, the tests must be extended:
  - Test 3 needs a strict check on the room's unlock status (`data-testid="room-status"`).
  - Test 2 needs a multi-session or multi-login check to ensure that the lock applies symmetrically to both users involved in the approval.

### 3. Caveats
- Exact DOM selectors (like `data-testid="room-status"`) are provided as examples; the worker should adapt them to the actual implemented UI if different.
- Multi-user simulation in Test 2 will require either two separate browser contexts or a sequential logout/login flow.

### 4. Conclusion
The testing implementer must update Test 2 and Test 3 within the 5 test cases to include the explicit assertions detailed in the strategy. They must ensure the tests run genuinely against the E2E environment.

### 5. Verification Method
- **Test 3**: Review the code for `expect(page.getByTestId('room-status')).toHaveText('Unlocked')` (or similar). Run `npx playwright test` to ensure it fails if the implementation does not unlock the room.
- **Test 2**: Review the code to see two distinct assertions for room state, one for User A and one for User B. Run `npx playwright test` to ensure it fails if either user sees the room as unlocked.
