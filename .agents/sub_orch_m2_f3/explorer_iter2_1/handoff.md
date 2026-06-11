# Handoff Report: F3 Admin Manager Boundary Tests Fix Strategy

## 1. Observation
The file `c:/Users/yairo/OneDrive/Desktop/new-project/tests/e2e/tier2_boundary/f3_admin_manager_boundary.spec.ts` relies on hardcoded magic URLs and implicitly assumes pre-existing test data rather than actively setting up the necessary data states.
Specifically:
- Test 2 assumes 0 unassigned users.
- Test 3 uses `?eventId=overcap` to test over-capacity.
- Test 4 uses `?eventId=gender-collision` to test gender collision.
- Test 5 uses `/admin/events/empty-event` to test empty events.
Additionally, the `/admin` features are not yet implemented in the codebase.

## 2. Logic Chain
1. To ensure E2E tests are robust and independent, each test must create its own isolated state using the application's backend API or UI, rather than relying on assumed data or hardcoded `eventId` strings.
2. The fix strategy must replace the navigation to magic URLs with an explicit setup phase (using `test.beforeAll` or inside the test itself) leveraging Playwright's `request` to make HTTP calls to backend endpoints (e.g., `POST /api/events`, `POST /api/users`, `POST /api/rooms`).
3. For Test 2 (Zero-state): Create an event, create rooms with capacities, and create an equal number of users. Allocate them all via API so that 0 unassigned users remain, then test the auto-allocation UI.
4. For Test 3 (Over-capacity): Create an event, create a room with 4 beds, and create 5 users via API. Navigate to the generated event's allocation page.
5. For Test 4 (Gender collision): Create an event, create a male room with 1 bed, and create 1 female user via API. Navigate to the generated event's allocation page.
6. For Test 5 (Empty event): Create an event with 0 participants and 0 rooms via API. Navigate to the generated event's dashboard.
7. Note: since the `/admin` UI and backend features might not be fully implemented, the developer must also ensure the backend endpoints for creating events/users/rooms and the frontend UI are built for the tests to pass. However, from a test perspective, implementing the proper data setup is the immediate fix.

## 3. Caveats
- The exact API endpoints (e.g., `POST /api/events`) and their payloads may not be fully defined or implemented yet. The fix strategy assumes standard RESTful endpoints will be created or used for seeding.
- This strategy focuses on E2E data setup. The tests will still fail if the `/admin` frontend features and backend logic are missing.

## 4. Conclusion
The E2E tests must be refactored to dynamically set up test data using Playwright's API request context (`request.post`). The strategy involves:
1. Creating an explicit setup function for each test that uses the backend API to generate events, rooms, and users.
2. Saving the generated `eventId` and navigating to `/admin/allocation?eventId=${eventId}` instead of using magic strings.
3. Removing all assumptions about pre-existing data.

## 5. Verification Method
1. Verify the implementation of the E2E test file (`f3_admin_manager_boundary.spec.ts`).
2. Confirm the absence of hardcoded magic URLs like `overcap`, `gender-collision`, and `empty-event`.
3. Check for `await request.post(...)` or similar setup logic that dynamically prepares the required test data (events, users, rooms).
4. Run `npx playwright test tests/e2e/tier2_boundary/f3_admin_manager_boundary.spec.ts` (once the feature is implemented) to ensure tests execute genuinely.
