# Handoff: F2 Boundary & Corner Case Tests

## 1. Observation
- The `ORIGINAL_REQUEST.md` specifies a "bidirectional approval system where employees can invite roommates. Rooms are locked only when all invited roommates approve."
- The existing Tier 1 tests (`tests/e2e/tier1_feature/f2_roommate.spec.ts`) cover the happy paths: sending a request (same gender), accepting a request (locks room), declining, canceling, and preventing different-gender requests.
- Test locators rely on `data-testid` attributes such as `roommate-search-input`, `search-submit-btn`, `send-request-btn`, `accept-request-btn`, `toast-error`, `toast-success`, and `room-status-label`.

## 2. Logic Chain
Since Tier 1 handles the standard functional flows, Tier 2 (Boundary & Corner Cases) must address invalid state transitions, race conditions, and limit enforcements:

1. **Boundary: Self-Invitation (Identity Limits)**
   - Users might search for their own name. The system must prevent sending a request to oneself to avoid circular logic or locking a room with 1 person incorrectly.
2. **Boundary: Target Already Locked (State Limits)**
   - A user who has already accepted a roommate request (room is locked) should no longer be an eligible target for new requests.
3. **Corner Case: Auto-Cancellation on State Transition**
   - If User A has 3 pending incoming requests and 1 pending outgoing request, and User A accepts one incoming request, the room becomes locked. The system must automatically invalidate/cancel the other 3 requests.
4. **Corner Case: Mutual/Crossing Invitations**
   - User A sends a request to User B. Before seeing the notification, User B searches for User A and tries to send a request. The system should gracefully handle this (e.g., convert B's action into an "Accept" or block sending with a toast "You already have a pending request from this user").
5. **Boundary: Exceeding Room Capacity**
   - A user should not be able to spam outgoing requests beyond the room's maximum capacity (e.g., if capacity is 2, they shouldn't be able to have 5 pending outgoing requests, or at least they shouldn't be able to send a new request if they are already locked).

## 3. Caveats
- The exact room capacity (e.g., strictly 2 people vs 3+ people) is not explicitly defined in the initial prompt, though "all invited roommates approve" suggests >2 is possible. The "Exceeding Room Capacity" test assumes there is a maximum limit configured.
- The UI behavior for mutual invitations (whether it auto-accepts, shows an error, or changes the button text) is unverified; the implementer will need to adapt the Playwright assertions to the final frontend implementation.

## 4. Conclusion
Here are the 5 Boundary & Corner Case test designs to be implemented by the worker:

**Test 1: Prevent Self-Invitation**
- **Action:** Logged-in user searches for their own name using `roommate-search-input` and clicks `search-submit-btn`.
- **Expected:** Either the user does not appear in the search results (`search-result-item` not visible), or clicking `send-request-btn` shows a `toast-error` (e.g., "Cannot invite yourself").

**Test 2: Prevent Inviting an Already Locked User**
- **Action:** User searches for an employee who is already in a "Locked" room.
- **Expected:** Target user is either excluded from search results, or the UI shows a "Locked" badge next to their name and the `send-request-btn` is disabled/missing. If attempted, a `toast-error` appears.

**Test 3: Auto-Cancellation of Pending Requests Upon Locking**
- **Action:** User has multiple incoming and outgoing requests. User accepts one incoming request using `accept-request-btn`.
- **Expected:** `room-status-label` becomes "Locked". Navigating to outgoing/incoming requests pages shows the other requests have disappeared or are marked "Cancelled"/"Declined".

**Test 4: Graceful Handling of Mutual Invitations**
- **Action:** User B receives a background request from User A. User B searches for User A and tries to send an outgoing request using `send-request-btn`.
- **Expected:** System detects the crossing request and shows a `toast-error` ("You already have an incoming request from this user") or automatically resolves it as an acceptance.

**Test 5: Prevent Sending Requests Exceeding Room Capacity**
- **Action:** User attempts to send multiple outgoing requests (e.g., 3 requests for a 2-person room limit).
- **Expected:** The system blocks the Nth request with a `toast-error` (e.g., "Maximum pending requests reached") or disables the `send-request-btn`.

## 5. Verification Method
- The worker will implement these tests in `tests/e2e/tier2_boundary/f2_boundary.spec.ts`.
- Verification is done by running `npx playwright test tests/e2e/tier2_boundary/f2_boundary.spec.ts`.
- All 5 tests must pass without timing out, ensuring the UI properly enforces these boundary rules.
