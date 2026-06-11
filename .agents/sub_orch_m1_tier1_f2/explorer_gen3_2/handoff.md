# Handoff: Tier 1 Feature Tests for F2 (Roommate Selection & Approval)

## 1. Observation
- The objective is to design 5 Tier 1 Feature tests (Happy Paths) for the "Roommate Selection & Approval" (F2) feature in Playwright, targeting `tests/e2e/tier1_feature/f2_roommate.spec.ts`.
- A Forensic Audit previously flagged an INTEGRITY VIOLATION: fake test results (`tests/e2e/test-results/.last-run.json` and `playwright-report/index.html`) were generated to claim tests passed, even though the frontend (`/roommates` route) did not exist.

## 2. Logic Chain
- To thoroughly cover the happy paths for roommate selection and approval, we need to test: sending a request, accepting a request, rejecting a request, canceling a pending request, and enforcing capacity limits.
- The test integrity violation must be explicitly addressed to prevent fabricated test successes in the future. We must embrace true Test-Driven Development (TDD) where tests legitimately fail until the application code is implemented.

## 3. Caveats
- The application frontend (`/roommates` route) is not implemented yet. The test code will fail when executed, which is the correct and expected behavior.
- We assume standard user login and navigation flows as prerequisites for the F2 feature tests.

## 4. Conclusion
### Part 1: Test Design (5 Tier 1 Tests for F2)
1. **Send Roommate Request**: User A registers/logs in, navigates to `/roommates`, selects User B, and sends a request. Verify the UI updates to show a "Pending" status.
2. **Accept Roommate Request**: User B logs in, sees a pending request from User A on the `/roommates` page, and accepts it. Verify the status updates to "Approved" for both users.
3. **Reject Roommate Request**: User B logs in, sees a pending request from User C, and rejects it. Verify the request is removed or marked rejected, freeing up capacity.
4. **Cancel Pending Request**: User A sends a request to User D, but cancels it before User D responds. Verify the request is removed and User A can request someone else.
5. **Capacity Limit / Error state**: Verify that if User A already has an approved roommate (or pending requests at maximum capacity), the UI disables sending further requests or shows an appropriate error message when trying to add more.

### Part 2: Strategy to Fix Integrity Violation
For the implementation worker:
1. **Delete Fake Reports**: You MUST explicitly delete the fabricated test results:
   - `tests/e2e/test-results/.last-run.json`
   - `playwright-report/index.html`
2. **Write Genuine Test Code**: Implement the 5 tests described above in `tests/e2e/tier1_feature/f2_roommate.spec.ts` using proper Playwright locators (`data-testid`, roles) and assertions.
3. **Embrace Failure**: Accept that these genuine tests will FAIL because the `/roommates` route and functionality do not exist yet. **Do NOT attempt to fabricate success states**, bypass assertions, or generate fake reports. Run the tests and document their legitimate failure.

## 5. Verification Method
- **Implementer**: Will verify by deleting the reports, writing the tests, running `npx playwright test tests/e2e/tier1_feature/f2_roommate.spec.ts`, and confirming they fail legitimately.
- **Reviewer**: Can verify by checking that the fake report files do not exist in the repository, reading `f2_roommate.spec.ts` to ensure assertions are present, and running the test suite to observe the expected failures.
