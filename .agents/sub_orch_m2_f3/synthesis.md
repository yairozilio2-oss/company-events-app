# Synthesis: F3 Admin & Manager Capabilities Boundary Tests

## Consensus
Both explorers identified the boundaries of the auto-allocation algorithm (zero state, capacity limits, gender collision) and the report generation (empty data) as critical F3 boundaries.

## Selected 5 Boundary Scenarios

1. **Date Boundary Validation on Event Creation**
   - **Action:** Admin attempts to create an event with a deadline exactly 1 minute in the past, then 1 minute in the future.
   - **Expected:** Past deadline triggers validation error. Future deadline succeeds.

2. **Zero-state Auto-Allocation**
   - **Action:** Admin clicks 'Run Automatic Allocation' when 0 users are unassigned (e.g., all registered users already locked in rooms).
   - **Expected:** System processes without error, UI handles the 0-allocation gracefully.

3. **Auto-Allocation Capacity Breach (Over-capacity)**
   - **Action:** 5 unassigned users, but only 4 beds available. Admin triggers auto-allocation.
   - **Expected:** 4 users are allocated. Exactly 1 user remains unassigned, with appropriate warning/UI indication.

4. **Auto-allocation Strict Gender Collision**
   - **Action:** 1 unassigned female, only available bed is in a male room. Admin triggers auto-allocation.
   - **Expected:** Female user remains unassigned. Auto-allocation finishes without errors but makes 0 allocations, strictly enforcing the gender separation rule.

5. **Occupancy Report Empty Boundary**
   - **Action:** Admin clicks 'Export Occupancy Report' for a 0-participant event.
   - **Expected:** File generates successfully but contains only headers and 0 data rows.

These scenarios must be implemented using Playwright in the `tests/e2e/tier2_boundary/f3_admin_manager.spec.ts` file, utilizing `data-testid` or accessible ARIA roles.
