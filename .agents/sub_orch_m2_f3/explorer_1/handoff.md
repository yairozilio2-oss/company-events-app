# Handoff Report: F3 Admin & Manager Capabilities Test Design

## 1. Observation
- `TEST_INFRA.md` specifies "Feature 3: Admin & Manager Capabilities | Source (requirement): R3".
- `TEST_INFRA.md` mandates testing using the "Methodology: Category-Partition + BVA + Pairwise + Workload Testing." and defines Tier 2 as "Boundary/Corner Cases" requiring "≥5 per feature (where boundaries exist)".
- `ORIGINAL_REQUEST.md` details R3 as: "A dashboard for managers/admins to create events, set deadlines, run automatic allocation for unassigned users, and view/export occupancy reports."
- `ORIGINAL_REQUEST.md` Acceptance Criteria for Admin Capabilities: "Admin can trigger auto-allocation for employees who selected 'don't care'." and "The system assigns them to valid rooms based on gender separation rules."

## 2. Logic Chain
- Based on the core capabilities defined in R3 (Event Creation, Deadlines, Auto-allocation, Occupancy Reports), we can derive distinct boundary and corner conditions.
- **Auto-allocation**: Must handle boundary edge cases such as exact zero capacity and indivisible groups based on gender rules. Idempotency (running it twice) is also a classic administrative corner case.
- **Event Creation/Deadlines**: Setting a deadline requires boundary checks around current and past times.
- **Occupancy Reports**: Empty reports represent the absolute minimum boundary for data export tools.
- To fulfill the exact requirement of 5 Playwright scenarios for Tier 2, the following boundary cases directly map to the observed criteria:

### Proposed Playwright Test Scenarios (Tier 2: Boundary & Corner Cases)

1. **Scenario: Event Deadline - Exact Current Time Boundary**
   - **Context**: Admin creates an event and attempts to set the registration deadline to the exact current minute or slightly in the past.
   - **Playwright Steps**: Fill out event details, enter the current timestamp into the deadline field, submit form.
   - **Expected Outcome**: UI should explicitly reject the past/current time with a validation error, preventing the creation of an already-expired event.

2. **Scenario: Auto-Allocation - Exact Zero Capacity Boundary**
   - **Context**: Admin clicks "run automatic allocation", but there are exactly 0 unallocated beds available in the event configuration.
   - **Playwright Steps**: Create a 2-person event, manually allocate 2 people. Have 1 "don't care" user unassigned. Click `Trigger Auto-Allocation`.
   - **Expected Outcome**: The system should present an alert/toast indicating "0 rooms available" and leave the extra user cleanly unassigned (or waitlisted), without throwing an unhandled exception or breaking existing allocations.

3. **Scenario: Auto-Allocation - Odd-Number Gender Boundary**
   - **Context**: Testing the gender separation constraint with an odd number of remaining users. 
   - **Playwright Steps**: Setup 2-person rooms. Register 3 male users and 1 female user as "don't care". Trigger `Auto-Allocation`.
   - **Expected Outcome**: 2 males are placed in Room 1. The remaining 1 male and 1 female CANNOT be placed in Room 2 due to gender separation rules. They must be left unassigned or placed in single rooms if applicable.

4. **Scenario: Auto-Allocation - Idempotency (Double Execution)**
   - **Context**: Admin triggers auto-allocation consecutively to test for duplicate assignments or state corruption.
   - **Playwright Steps**: Have 2 "don't care" users and 1 room. Click `Trigger Auto-Allocation`. Wait for success. Click `Trigger Auto-Allocation` a second time immediately.
   - **Expected Outcome**: The second execution should yield a "No unassigned users" or "Allocations complete" message, and the 2 users should remain assigned to exactly one room without duplication.

5. **Scenario: Occupancy Reports - Empty Data Boundary**
   - **Context**: Admin attempts to export the occupancy report for an event that has 0 registrations.
   - **Playwright Steps**: Navigate to a newly created event with no users. Click `Export Occupancy Report`.
   - **Expected Outcome**: The file download triggers successfully, resulting in a generated CSV/Excel file containing only headers, without throwing a server 500 error.

## 3. Caveats
- No implementation code exists yet, so specific DOM selectors (e.g., `#auto-allocate-btn`) are omitted. Test engineers will need to update Playwright scripts with final `data-testid` attributes.
- Assumption made that waitlisting or leaving a user "unassigned" is the correct domain behavior for zero capacity; this may need clarification with the product owner.

## 4. Conclusion
We have identified and structured exactly 5 Tier-2 boundary and corner-case scenarios for the F3 "Admin & Manager Capabilities" feature, adhering to the project's Playwright web UI testing standards and the provided requirement specifications. These scenarios cover temporal boundaries, resource exhaustion (zero capacity), domain constraints (gender math), idempotency, and empty state boundaries.

## 5. Verification Method
- **Review Method**: Compare the 5 scenarios against `TEST_INFRA.md`'s Tier 2 boundary requirements to ensure compliance.
- **Execution**: Once the UI is built, implement these 5 scenarios in `tests/e2e/tier2_boundary/test_admin_capabilities.spec.ts`.
- **Invalidation**: If the Product Owner determines that male/female users *can* share rooms under certain circumstances, or if Auto-allocation is removed from the scope, Scenario 3 will be invalidated.
