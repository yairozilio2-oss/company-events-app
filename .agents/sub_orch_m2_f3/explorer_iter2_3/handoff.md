# Handoff Report: F3 Admin Manager Boundary Tests Fix Strategy

## 1. Observation
A review of `c:/Users/yairo/OneDrive/Desktop/new-project/tests/e2e/tier2_boundary/f3_admin_manager_boundary.spec.ts` confirms the auditor's findings. The tests currently use hardcoded, "magic" query parameters and route paths (e.g., `eventId=overcap`, `eventId=gender-collision`, `/empty-event`) to bypass the setup of complex boundary scenarios. 

Specifically:
- **Test 2** assumes a zero-state environment implicitly without explicit setup.
- **Test 3** uses `?eventId=overcap` to simulate a scenario with 5 users and 4 beds.
- **Test 4** uses `?eventId=gender-collision` to simulate 1 female user and 1 male bed.
- **Test 5** hardcodes the navigation to `/admin/events/empty-event`.

## 2. Logic Chain
1. To resolve the integrity violation, the tests must dynamically provision the exact environment required for each boundary condition before exercising the UI.
2. Relying on hardcoded states makes tests fragile and invalidates the end-to-end nature of the scenarios, as it skips crucial data insertion steps.
3. Because UI-driven setup for complex allocation rules is often slow and prone to flakiness, the most robust E2E strategy is to utilize Playwright's `request` context (API testing context) to seed the database dynamically in a `test.beforeEach` or at the start of each test block.
4. By dynamically calling backend endpoints to create the events, rooms, and users, we obtain authentic database-backed IDs which are then used to navigate the UI correctly (e.g. navigating to `/admin/allocation?eventId=${dynamicEventId}`).

## 3. Caveats
- The auditor noted that the backend `/admin` routes and related features are not yet implemented. This means the proposed API setup calls (e.g., `POST /api/events`, `POST /api/rooms`, `POST /api/users`) will currently fail if executed. 
- The fix strategy assumes standard RESTful endpoints for resource creation. When the backend is actually implemented, the exact URLs and payloads may need adjustment to match the final API specification.

## 4. Conclusion
The recommended fix strategy is to refactor `f3_admin_manager_boundary.spec.ts` to use Playwright's `request` API for dynamic data provisioning. The specific approach per test is as follows:

- **Test 2 (Zero-state Auto-Allocation):** Use API to create a fresh Event, skip adding any users, and capture the `eventId`. Navigate to `/admin/allocation?eventId=${eventId}` and assert zero allocations.
- **Test 3 (Capacity Breach):** Use API to create a fresh Event, create Room(s) containing a total of 4 beds, and create/register 5 Users. Navigate to `/admin/allocation?eventId=${eventId}` and verify that 4 are allocated and 1 is unassigned.
- **Test 4 (Gender Collision):** Use API to create a fresh Event, create 1 male-designated Room (1 bed), and create/register 1 female User. Navigate to `/admin/allocation?eventId=${eventId}` and verify 0 allocations occur.
- **Test 5 (Empty Boundary Report):** Use API to create an Event with 0 registered participants. Navigate to `/admin/events/${eventId}` and test the occupancy report download.

## 5. Verification Method
1. Inspect the updated `f3_admin_manager_boundary.spec.ts` file.
2. Verify that `request.post` (or an equivalent API helper) is used at the beginning of tests 2, 3, 4, and 5 to create resources.
3. Ensure no hardcoded strings like `overcap` or `gender-collision` exist in the URLs. All URLs should utilize dynamically generated IDs returned from the API setup steps.
4. When the backend features are implemented, run `npx playwright test tests/e2e/tier2_boundary/f3_admin_manager_boundary.spec.ts` to confirm the scenarios execute successfully against a real database.
