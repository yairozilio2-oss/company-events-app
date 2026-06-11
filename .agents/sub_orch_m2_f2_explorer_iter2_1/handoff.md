# F2: Roommate Selection & Approval Boundary Tests Design

## 1. Observation
- The testing strategy mandates Playwright/TypeScript E2E tests using `data-testid` locators (`TEST_INFRA.md`, `SCOPE.md`).
- Existing tests in `tests/e2e/tier1_feature/f2_roommate.spec.ts` reveal the feature layout:
  - Search page (`/roommates`) with `roommate-search-input` and `search-submit-btn`.
  - Results use `search-result-item` and `send-request-btn`.
  - Requests pages (`/roommates/requests`, `/roommates/outgoing`) with `incoming-request-item` / `outgoing-request-item` and `accept-request-btn` / `decline-request-btn` / `cancel-request-btn`.
  - Notifications are verified via `toast-success` and `toast-error`.
  - Room status is shown via `room-status-label` ('Locked' / 'Unlocked').

## 2. Logic Chain
Based on Category-Partition and BVA methodology, the following 5 boundary/corner cases address critical edge states in the roommate selection state machine:

**Test 1: Self-Selection Prevention (Boundary Input)**
- **Scenario**: A user attempts to search for and send a request to themselves.
- **Strategy**: Search for the logged-in user's own name.
- **Expected**: The search results should either not display the user, or the `send-request-btn` should be disabled/hidden, or clicking it should trigger a `toast-error`.

**Test 2: Target User is Already Locked (State Boundary)**
- **Scenario**: Attempting to send a request to an employee who already has a finalized roommate (Status: Locked).
- **Strategy**: Pre-seed a target user who is already matched. Search for them.
- **Expected**: The target may appear in search results but should not be requestable. The test should assert that the `send-request-btn` is disabled or not present, or if it is clicked, it should return a `toast-error` (e.g., "User is already matched").

**Test 3: Duplicate Request Prevention (Idempotency/Boundary)**
- **Scenario**: A user attempts to send a second roommate request to the same target who already has a pending request from them.
- **Strategy**: Send a request to User B. Wait for `toast-success`. Try to send another request to User B from the search page.
- **Expected**: The `send-request-btn` on the search result should change to "Pending" (disabled), or attempting to send again should yield a `toast-error` (e.g., "Request already sent").

**Test 4: Mutual Exclusivity on Acceptance (State Transition Corner Case)**
- **Scenario**: A user receives multiple roommate requests. Accepting one must lock the room and invalidate the others.
- **Strategy**: Pre-seed the logged-in user with two incoming requests (from User B and User C). Navigate to `/roommates/requests`. Accept User B's request.
- **Expected**: Room status becomes `Locked`. The request from User C should no longer be visible or attempting to accept it should fail with a `toast-error`.

**Test 5: Sender Became Unavailable / Race Condition (Cross-State Corner Case)**
- **Scenario**: User A sends a request to User B. Before User B accepts, User A accepts a request from User C (User A becomes Locked). User B then attempts to accept User A's request.
- **Strategy**: 
  1. Pre-seed User B with an incoming request from User A. 
  2. Modify User A's state in the backend to be `Locked`.
  3. Logged in as User B, navigate to `/roommates/requests` and click `accept-request-btn` for User A's request.
- **Expected**: The system should reject the acceptance, display a `toast-error` (e.g., "This user is no longer available"), and the room status for User B should remain `Unlocked`.

## 3. Caveats
- **UI Implementation Variance**: Since we are designing black-box tests without source code access, we assume standard behaviors (e.g., `toast-error` vs disabled buttons). Implementers may need to adjust the exact assertions (e.g., `await expect(btn).toBeDisabled()` vs checking for a toast message).
- **Data Seeding**: Tests 2, 4, and 5 require specific database states to be seeded prior to the test execution. The implementation must include appropriate backend setup calls.

## 4. Conclusion
We have designed 5 comprehensive boundary and corner case tests for the F2 feature that cover invalid inputs, idempotency, state mutual exclusivity, and race conditions. These tests adhere to the Playwright constraints and locator strategies established in the Tier 1 tests. They should be implemented in `tests/e2e/tier2_boundary/f2_roommate_boundary.spec.ts`.

## 5. Verification Method
- The tests will be implemented by the worker agent in `tests/e2e/tier2_boundary/f2_roommate_boundary.spec.ts`.
- Verification command: `npx playwright test tests/e2e/tier2_boundary/f2_roommate_boundary.spec.ts`
- A successful run of all 5 tests confirms the boundary conditions are appropriately handled by the system.
