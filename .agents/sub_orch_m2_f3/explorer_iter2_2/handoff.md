# Handoff Report: Fix Strategy for F3 Admin Manager Boundary Tests

## 1. Observation
- Inspected the test file `c:/Users/yairo/OneDrive/Desktop/new-project/tests/e2e/tier2_boundary/f3_admin_manager_boundary.spec.ts`.
- Found that the tests rely on hardcoded magic URLs (e.g., `?eventId=overcap`, `?eventId=gender-collision`, `/empty-event`) and explicitly assume pre-existing test data via comments without setting it up.
- Inspected `backend/src/index.ts` and `frontend/app`. The frontend `/admin` routes and backend admin API endpoints are entirely absent from the codebase.
- Verified `backend/prisma/schema.prisma` defines `Event`, `Room`, `User`, and `Registration` models which are necessary for creating proper state.

## 2. Logic Chain
1.  **Missing Functionality**: Because the frontend `/admin` routes and backend admin APIs do not exist, the test file currently attempts to verify phantom features, causing an inevitable unconditional failure.
2.  **Improper Setup**: For boundary tests to run genuinely, they must act upon a verifiable system state. This means events, users, rooms, and registrations must be explicitly populated before testing auto-allocation or export features.
3.  **API Test Seeding**: The Playwright tests should use the `request` API context to make calls to backend endpoints (e.g., `POST /api/admin/events`, `POST /api/admin/rooms`, `POST /api/users`, `POST /api/registrations`) to seed each test's required specific scenarios just-in-time, instead of using magic URLs.
4.  **Dynamic Variables**: The tests must parse the response of the API requests to extract dynamic IDs (`const eventId = response.json().id`) and inject them into page navigations (e.g., `await page.goto('/admin/allocation?eventId=' + eventId);`).

## 3. Caveats
- Since the codebase currently lacks the necessary backend Admin APIs (and UI features), this fix strategy relies on those features being implemented concurrently or sequentially before the E2E tests can be realistically run and pass.
- An alternative approach is to implement a dedicated test-only seed route (e.g., `POST /api/test/seed`) that bypasses business logic to interact directly with the Prisma DB for rapid state injection during tests.

## 4. Conclusion
**Fix Strategy**:
The test file `f3_admin_manager_boundary.spec.ts` must be rewritten to dynamically create test data for each boundary condition using Playwright's `request` interface to interact with the backend API. 

The strategy per test is:
-   **Test 2 (Zero-state)**: Use `request.post` to create a new `Event` with zero registrations. Navigate to the UI using the dynamically generated `eventId`.
-   **Test 3 (Capacity Breach)**: Use `request.post` to create 1 `Event`, 1 `Room` (capacity=4), 5 `User`s, and 5 `Registration`s to the event. Navigate to the UI using the generated `eventId`.
-   **Test 4 (Gender Collision)**: Use `request.post` to create 1 `Event`, 1 `Room` (capacity=1, gender="M"), 1 female `User` (gender="F"), and 1 `Registration`. Navigate to the UI using the generated `eventId`.
-   **Test 5 (Empty Event)**: Use `request.post` to create 1 `Event` with 0 participants. Navigate using the generated `eventId`.

**Prerequisite Action**: An implementer must first develop the underlying backend Admin endpoints and frontend Admin views so that the E2E E2E setup and tests have actual targets.

## 5. Verification Method
1. Wait for implementation of backend Admin APIs (events, rooms, users, registrations) and frontend views.
2. Review the updated `f3_admin_manager_boundary.spec.ts` using `view_file` to confirm that tests utilize `request.post(...)` to dynamically seed data instead of static magic URLs.
3. Confirm that hardcoded query variables like `?eventId=overcap` are completely removed.
4. Run the project test command (`npx playwright test tests/e2e/tier2_boundary/f3_admin_manager_boundary.spec.ts`) against a clean database to ensure the setup completes and tests pass legitimately.
