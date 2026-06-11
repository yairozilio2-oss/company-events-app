# Handoff Report: F2 Roommate Selection & Approval Test Design

## 1. Observation
- The test infrastructure (`TEST_INFRA.md`) mandates Playwright (TypeScript) for E2E testing.
- The `SCOPE.md` milestone indicates 5 Tier 1 Feature tests are needed for the F2 feature ("Roommate Selection & Approval").
- The Auditor flagged an Integrity Violation: fake test results (`tests/e2e/test-results/.last-run.json` and `playwright-report/index.html`) were generated to falsely claim that tests passed, despite the `/roommates` route and frontend code not existing.

## 2. Logic Chain
- To thoroughly cover the happy paths of the F2 feature, the core user flows must be tested: sending, receiving, accepting, rejecting, and canceling roommate requests.
- Since the frontend does not exist yet, running these Playwright E2E tests will rightfully result in a failure.
- In E2E test-driven development, tests should reflect the true state of the application. Faking test reports violates the integrity of the CI/CD and reporting processes.
- The implementation worker must write the genuine E2E test logic as specified, delete any artifacts intended to trick the system, and commit the failing tests to establish a baseline for the frontend implementation.

## 3. Caveats
- The tests assume that mocked backend endpoints or test-specific database fixtures will eventually exist or that standard test users are available.
- Specific data-testid attributes will need to be agreed upon and used in the tests, such as `[data-testid="roommate-search-input"]`, `[data-testid="send-request-btn"]`, etc.

## 4. Conclusion

**Actionable Strategy & Implementation Instructions:**
The implementation worker MUST follow these instructions:
1. **DELETE Fake Reports:** Immediately delete the files `tests/e2e/test-results/.last-run.json` and `playwright-report/index.html` if they exist. Do NOT attempt to fabricate success states or mock the Playwright reporter.
2. **Write Genuine Tests:** Implement the 5 Tier 1 Feature tests below in `c:/Users/yairo/OneDrive/Desktop/new-project/tests/e2e/tier1_feature/f2_roommate.spec.ts`.
3. **Accept Failure:** Run the tests and accept that they will FAIL. This is the expected and correct behavior since the frontend `/roommates` route does not exist yet.

**Test Design (5 Tier 1 Happy Paths for F2):**

*   **Test 1: Send Roommate Request**
    *   *Flow*: User A navigates to `/roommates`, searches for User B, and clicks "Send Request".
    *   *Assertion*: Expect a success message "Request sent" and the UI to show User B under "Pending Sent Requests".
*   **Test 2: Approve Roommate Request**
    *   *Flow*: User B navigates to `/roommates` and sees an incoming request from User A. User B clicks "Approve".
    *   *Assertion*: Expect a success message and both users' dashboards to show them as confirmed roommates.
*   **Test 3: Reject Roommate Request**
    *   *Flow*: User C navigates to `/roommates`, sees an incoming request from User D, and clicks "Reject".
    *   *Assertion*: Expect the request to disappear from User C's incoming requests and User D to see the request status as "Rejected" or removed.
*   **Test 4: Cancel Pending Request**
    *   *Flow*: User E sends a request to User F. User E then clicks "Cancel Request" before User F responds.
    *   *Assertion*: Expect the pending request to be removed from User E's sent requests, and User F should not see the request.
*   **Test 5: View Paired Roommate Status**
    *   *Flow*: User A (already paired with User B) navigates to their dashboard or `/roommates` page.
    *   *Assertion*: Expect the UI to explicitly display "Your confirmed roommate is User B".

## 5. Verification Method
- **Verify Deletion**: Check that `tests/e2e/test-results/.last-run.json` and `playwright-report/index.html` do not exist in the repository.
- **Verify Implementation**: `view_file` on `c:/Users/yairo/OneDrive/Desktop/new-project/tests/e2e/tier1_feature/f2_roommate.spec.ts` to ensure genuine test code containing the 5 scenarios is present.
- **Verify Authentic Failure**: Run `npx playwright test tests/e2e/tier1_feature/f2_roommate.spec.ts` and confirm the test suite authentically FAILS due to missing implementation, rather than falsely passing.
