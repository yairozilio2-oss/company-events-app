# Handoff: F2 Playwright Test Design

## 1. Observation
- Inspected the project requirements in `c:\Users\yairo\OneDrive\Desktop\new-project\ORIGINAL_REQUEST.md`.
- R2 specifies: "A bidirectional approval system where employees can invite roommates. Rooms are locked only when all invited roommates approve."
- Acceptance Criteria specifies:
  - Employee can send a request, another can accept.
  - Room status locks upon all acceptances.
  - Gender separation rules are enforced (different genders cannot share a room).

## 2. Logic Chain
- Based on the acceptance criteria, the core functional flows for roommate selection require testing:
  - **Happy Path 1 (Send Request):** Ensuring the initial invite action works and status updates.
  - **Happy Path 2 (Accept Request & Lock):** Ensuring bidirectional approval completes the flow and locks the room.
  - **Happy Path 3 (Enforce Gender Rules):** Ensuring the system blocks invalid matches per the explicit acceptance criteria.
  - **Happy Path 4 (Decline Request):** Covering the negative/alternate path where an invitation is rejected, keeping the room unlocked.
  - **Happy Path 5 (Lock state prevents actions):** Ensuring that a locked room prevents further, invalid changes.
- I drafted the Playwright test scenarios around these specific user journeys.

## 3. Caveats
- The room capacity is assumed to be 2 for the purpose of test simplicity, but if the system allows more than 2 roommates per room, the "Lock Room" condition in Test Case 2 would require all *invited* roommates to accept.
- The precise UI locators or language (Hebrew text vs. data-testid) are not defined yet since the frontend is not implemented.

## 4. Conclusion
- I have successfully designed 5 Tier 1 Feature tests for the F2 'Roommate Selection & Approval' feature.
- The test design covers sending, accepting, declining, locking the room, and enforcing gender rules.
- The report has been written to `c:\Users\yairo\OneDrive\Desktop\new-project\.agents\explorer_f2\f2_test_design.md`.

## 5. Verification Method
- Review the test design document at `c:\Users\yairo\OneDrive\Desktop\new-project\.agents\explorer_f2\f2_test_design.md`.
- Compare the coverage against the "Roommate Selection" section of `ORIGINAL_REQUEST.md`.
