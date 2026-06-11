# Handoff Report: F3 Admin & Manager Capabilities - Boundary Test Scenarios

## Observation
- `TEST_INFRA.md` specifies Playwright for E2E testing (TypeScript) and requires exactly 5 boundary/corner case scenarios for Tier 2 testing of each feature.
- `ORIGINAL_REQUEST.md` defines F3 (Admin & Manager Capabilities) as: dashboard to create events, set deadlines, run automatic allocation for unassigned users ("don't care"), enforce gender separation rules, and view/export occupancy reports.

## Logic Chain
To achieve high coverage of edge cases in Admin & Manager functionality through the Playwright UI:
1. **Event Creation Limits:** The deadline date is a critical boundary. Testing past vs immediate future deadlines ensures input validation works.
2. **Auto-Allocation Zero-State:** The system must handle the edge case where the admin triggers auto-allocation but no actionable users exist (empty workload).
3. **Auto-Allocation Odd/Fractional Workloads:** Gender separation rules interacting with auto-allocation require a test for odd numbers of users per gender, ensuring the system doesn't create mixed rooms or crash when a room cannot be perfectly filled.
4. **Auto-Allocation Capacity Breach:** The boundary where unassigned users outnumber available room slots must be tested to ensure the system halts allocation cleanly without overbooking.
5. **Report Generation Boundaries:** Generating reports at exactly 0 occupancy and 100% capacity are fundamental boundary conditions for data export functionality.

## Test Scenarios Designed

**1. Date Boundary Validation on Event Creation**
- **Action:** Admin attempts to create an event with a deadline exactly 1 minute in the past, then 1 minute in the future.
- **Assertion:** Playwright verifies that the past deadline triggers a UI validation error and prevents submission, while the future deadline successfully creates the event.

**2. Zero-state Auto-Allocation**
- **Action:** Admin clicks 'Run Automatic Allocation' on the dashboard for an event where all registered users are already in fully locked rooms.
- **Assertion:** Playwright verifies the appearance of an informational message (e.g., "0 users to allocate") and confirms the room occupancy table remains unchanged.

**3. Auto-Allocation with Odd Gender Demographics (Leftover Handling)**
- **Action:** Admin runs 'Automatic Allocation' where exactly 3 male and 1 female users are unassigned (assuming standard 2-person rooms).
- **Assertion:** Playwright verifies the occupancy table updates to show 1 full male room, 1 partially full male room (or 1 male left unassigned), and 1 partially full female room, strictly confirming no mixed-gender rooms are created.

**4. Auto-Allocation at Exact Maximum Capacity Boundary**
- **Action:** Admin triggers auto-allocation for an event with exactly 2 remaining bed slots but 3 unassigned users who selected "don't care".
- **Assertion:** Playwright verifies that exactly 2 users are assigned, filling the venue to 100%, and the 3rd user is visibly marked as 'Waitlisted' or 'Unassigned' with a venue-full UI warning.

**5. Report Export Empty and Full Boundaries**
- **Action:** Admin clicks 'Export Occupancy Report' for a 0-participant event, and subsequently for an event at exactly 100% maximum capacity.
- **Assertion:** Playwright intercepts the download events, verifying the empty report contains only headers, and the full report contains exactly the maximum number of rows.

## Caveats
- Assumptions are made about default room capacity (e.g., 2 persons per room). If rooms are of variable sizes, scenarios 3 and 4 may need adjustment in data setup.
- File export interception in Playwright requires specific configuration for handling browser downloads.

## Conclusion
5 specific boundary and corner case scenarios for F3 (Admin & Manager Capabilities) have been successfully designed, targeting Playwright E2E UI automation. They cover date validation, zero-states, gender-separation edge cases, venue capacity limits, and file export boundaries.

## Verification Method
- Inspect the scenarios designed to ensure they accurately reflect UI and logical boundary conditions for admin functionalities.
