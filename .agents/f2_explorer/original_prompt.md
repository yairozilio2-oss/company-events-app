## 2026-06-11T09:12:31Z

Design a fix strategy for the Playwright tests for 'Roommate Selection & Approval' (F2).
The previous iteration failed the Reviewer gate.
Reviewer Feedback:
"The verdict is REQUEST_CHANGES. 
1. Test 3 does not verify the requirement 'leaving the room unlocked'. It only checks that the incoming request is hidden.
2. Test 2 does not verify that the room is locked for *both* users, which is explicitly requested."

Your fix strategy MUST explicitly address this reviewer feedback. Formulate a strategy advising the worker to:
- Add an explicit assertion in Test 3 that the room state is 'unlocked' (e.g. checking a data-testid="room-status" element).
- Add explicit assertions in Test 2 that check the room is locked for BOTH users (e.g. verifying the state, then simulating login as the other user and verifying again).

Explicitly recommend the worker to implement these exact fixes to the existing 5 test cases. Ensure you remind the worker to write genuine failing tests (E2E Testing Track) and NOT to fake outputs. Then provide your handoff report to 'f2_test_design.md'.
