# 1. Observation
- The testing strategy outlined in `TEST_INFRA.md` requires Tier 2 (Boundary) tests for the F2 feature (Roommate Selection & Approval).
- The scope defined in `.agents/sub_orch_m2_f2/SCOPE.md` specifies these tests must be located in `tests/e2e/tier2_boundary/` and use `data-testid` or ARIA roles.
- Analysis of the Tier 1 test `tests/e2e/tier1_feature/f2_roommate.spec.ts` reveals the following available components and paths:
  - **Routes**: `/roommates` (search/send), `/roommates/requests` (incoming), `/roommates/outgoing` (pending sent).
  - **Locators (data-testid)**: `roommate-search-input`, `search-submit-btn`, `search-result-item`, `send-request-btn`, `toast-success`, `toast-error`, `incoming-request-item`, `accept-request-btn`, `decline-request-btn`, `room-status-label`, `outgoing-request-item`, `cancel-request-btn`.
- Tier 1 already covers happy paths and the core gender constraint.

# 2. Logic Chain
To provide comprehensive boundary and corner-case coverage, we need to test limits, logic constraints, state changes, and simultaneous conditions not covered in Tier 1:
- **Test 1 (Self-Invitation)**: Users shouldn't be able to match with themselves. Trying to search/invite oneself should fail.
- **Test 2 (Locked Target)**: A user's room locks upon accepting a request. Searching for or sending a request to a user who is already locked should be prevented by the system.
- **Test 3 (Outgoing Limits)**: A user should realistically only be able to send 1 request at a time (or a strict max) since room size is limited. Testing multiple consecutive outgoing requests validates this limit.
- **Test 4 (Stale Incoming Requests)**: If User A has 2 incoming requests and accepts 1, their room locks. The 2nd request must be automatically invalidated, rejected, or hidden to prevent over-allocation.
- **Test 5 (Mutual Requests / Race Condition)**: If User A invites User B, and User B tries to invite User A (instead of accepting the existing request), the system should either gracefully auto-match them or throw a clear error preventing duplicate request objects.

# 3. Caveats
- The exact limit on outgoing requests is not explicitly documented in the available codebase; the tests assume a limit of 1. If it's higher, Test 3's limit checks will need to reflect the actual business logic.
- E2E tests involving multiple users (like Test 5) will require logging in and out, or using multiple Playwright browser contexts, to verify cross-user states.
- Mock data seeding will be required to set up these specific boundary states.

# 4. Conclusion
Here are the 5 Boundary & Corner Case tests to be implemented by the worker:

**Test 1: Prevent Self-Invitation**
- **Strategy**: Try to send a request to the logged-in user.
- **Locators/Actions**: 
  - Fill `roommate-search-input` with current user's name. Click `search-submit-btn`.
  - Check that the user is not found, OR if found in `search-result-item`, clicking `send-request-btn` should trigger a `toast-error` preventing self-invitation.

**Test 2: Target User Room Already Locked**
- **Strategy**: Try to invite a user whose room is already at capacity (Locked).
- **Locators/Actions**:
  - Pre-condition: Target user has accepted a request (Locked).
  - Fill `roommate-search-input` with target user. Click `search-submit-btn`.
  - Assert that `search-result-item` does not show the user, or `send-request-btn` is disabled.
  - If the button is clickable, assert that clicking it shows a `toast-error` (e.g. "User unavailable").

**Test 3: Maximum Outgoing Request Limit**
- **Strategy**: Send an outgoing request, then attempt to send a second one.
- **Locators/Actions**:
  - Send request to User B (`roommate-search-input` -> `search-submit-btn` -> `send-request-btn`).
  - Search for User C. Attempt to click `send-request-btn`.
  - Assert that a `toast-error` appears stating the outgoing limit is reached (or the button is disabled).
  - Go to `/roommates/outgoing` and confirm only one `outgoing-request-item` exists.

**Test 4: Auto-Invalidation of Pending Incoming Requests Upon Locking**
- **Strategy**: Have two pending incoming requests. Accept one. Ensure the other is no longer valid.
- **Locators/Actions**:
  - Pre-condition: User has incoming requests from B and C.
  - Go to `/roommates/requests`. See two `incoming-request-item` locators.
  - Click `accept-request-btn` on B's request. Wait for `toast-success` and `room-status-label` to be "Locked".
  - Assert that C's `incoming-request-item` is no longer visible, OR clicking `accept-request-btn` on it triggers a `toast-error`.

**Test 5: Mutual/Circular Invites**
- **Strategy**: User A invites B. User B attempts to invite A directly.
- **Locators/Actions**:
  - Context 1: User A sends request to B.
  - Context 2: User B navigates to `/roommates`. Searches for User A (`roommate-search-input`).
  - User B clicks `send-request-btn` on User A.
  - Assert that either they are auto-matched (`toast-success` with room "Locked"), or User B receives a `toast-error` advising them to check their incoming requests.

# 5. Verification Method
- **Implementer Action**: Implement the above in `tests/e2e/tier2_boundary/f2_roommate_boundary.spec.ts`.
- **Validation**: Run `npx playwright test tests/e2e/tier2_boundary/f2_roommate_boundary.spec.ts`. All 5 tests must pass without regressions to Tier 1 tests.
