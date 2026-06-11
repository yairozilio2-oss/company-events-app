# Handoff Report: F3 Admin & Manager Capabilities Boundary Tests

## 1. Observation
- From `ORIGINAL_REQUEST.md`: Requirement **R3. Admin & Manager Portal** states that admins must be able to "create events, set deadlines, run automatic allocation for unassigned users, and view/export occupancy reports." The Acceptance Criteria further specify that the auto-allocation must handle users who selected "don't care" and assign them to valid rooms based on **gender separation rules**.
- From `TEST_INFRA.md`: The test architecture mandates "Tier 2: Boundary/Corner Case tests," requiring exactly **5 test scenarios** for each feature where boundaries exist, which should be implemented using Playwright.

## 2. Logic Chain
The highest risk areas for boundaries in F3 involve the auto-allocation algorithm and data exports. Testing needs to cover edge cases regarding capacity constraints, empty states, and conflicting rules.

Based on this, I have designed the following 5 Boundary/Corner Case scenarios:

*   **Scenario 1: Auto-allocation with Zero Unassigned Users (Lower Boundary)**
    *   **Setup:** Event with 10 registered users, all of whom have fully locked rooms (0 unassigned users).
    *   **Action:** Admin clicks "Run Automatic Allocation".
    *   **Expected:** The system processes successfully without errors, reports 0 new allocations, and the UI remains stable.
*   **Scenario 2: Auto-allocation with Exact Capacity Match (Exact Fit Boundary)**
    *   **Setup:** Exactly 4 unassigned male users. The event has exactly two 2-bed rooms available (4 empty beds total).
    *   **Action:** Admin triggers auto-allocation.
    *   **Expected:** All 4 users are allocated perfectly. The system reports 0 unassigned users and 0 open beds remaining for males.
*   **Scenario 3: Auto-allocation with Insufficient Capacity (Over-capacity Boundary)**
    *   **Setup:** 5 unassigned female users, but only 2 double rooms (4 beds total) available for females.
    *   **Action:** Admin triggers auto-allocation.
    *   **Expected:** The system gracefully allocates 4 users to the 4 available beds. Exactly 1 user remains in the unassigned list, and the system displays a warning/notification regarding insufficient capacity.
*   **Scenario 4: Auto-allocation with Strict Gender Mismatch (Constraint Corner Case)**
    *   **Setup:** 1 unassigned female user. The only available open bed in the event is in a room currently occupied by 1 male.
    *   **Action:** Admin triggers auto-allocation.
    *   **Expected:** The auto-allocation algorithm finishes but makes 0 allocations. The female user remains unassigned, strictly enforcing the gender separation rule despite an available bed.
*   **Scenario 5: Occupancy Report Export on Empty Event (Zero Data Boundary)**
    *   **Setup:** Admin creates a brand-new event. 0 users have registered.
    *   **Action:** Admin navigates to the dashboard and exports the Occupancy Report (e.g., as CSV/PDF).
    *   **Expected:** The system generates and downloads the file successfully. The file contains correct headers but 0 data rows, and does not crash or display server errors.

## 3. Caveats
- The exact UI feedback for "insufficient capacity" (Scenario 3) is not strictly defined in the requirements. The test expects a graceful continuation (partial allocation) rather than a complete failure, which is standard application behavior.
- It is assumed that the Playwright test suite will include a reliable way to seed the database with these precise edge-case states (e.g., seeding exact combinations of users, rooms, and genders) prior to running the UI actions.

## 4. Conclusion
Exactly 5 Boundary & Corner Case Playwright test scenarios have been designed for the F3 Admin & Manager Capabilities. These scenarios rigorously test the extremes of the auto-allocation logic (zero users, exact capacity, over capacity, gender collisions) and the reporting feature (zero data). They are ready for implementation.

## 5. Verification Method
- Review the 5 scenarios listed in this handoff report.
- Verify they map to the `tests/e2e/tier2_boundary/` directory requirements outlined in `TEST_INFRA.md`.
- Ensure they specifically target boundaries rather than simple "happy paths".
