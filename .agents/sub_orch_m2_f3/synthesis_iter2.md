# Synthesis: F3 Boundary Tests Fix Strategy (Iteration 2)

## Problem
The previous implementation of `f3_admin_manager_boundary.spec.ts` used "shortcuts" (dummy implementations). It navigated to hardcoded magic URLs (e.g., `eventId=overcap`, `eventId=gender-collision`, `empty-event`) assuming the required boundary data was already present in the database. This is an INTEGRITY VIOLATION.

## Consensus Fix Strategy
To correct this, the tests MUST dynamically create the required test state using Playwright's `request` API to seed the database at the beginning of the test, prior to UI interaction.

## Updated Test Scenarios
Implement the following 5 tests in `tests/e2e/tier2_boundary/f3_admin_manager_boundary.spec.ts`. Use Playwright's APIRequestContext (`request`) to dynamically create the necessary resources, and use the returned dynamic IDs for UI navigation.

1. **Date Boundary Validation on Event Creation**
   - **UI Setup**: No API setup needed.
   - **Action**: Admin uses UI to attempt creating an event with a deadline 1 minute in the past (fails) and 1 minute in the future (succeeds).

2. **Zero-state Auto-Allocation**
   - **API Setup**: `POST /api/events` to create a new event. Do not add any users.
   - **UI Action**: Navigate to `/admin/allocation?eventId=${eventId}` and click auto-allocate.
   - **Expected**: 0 allocations made, system processes without error.

3. **Auto-Allocation Capacity Breach (Over-capacity)**
   - **API Setup**: `POST /api/events` to create an event. `POST /api/rooms` to create rooms with a total of 4 beds. `POST /api/users` to create 5 users registered for the event.
   - **UI Action**: Navigate to `/admin/allocation?eventId=${eventId}` and click auto-allocate.
   - **Expected**: 4 users allocated, 1 user unassigned with a warning.

4. **Auto-allocation Strict Gender Collision**
   - **API Setup**: `POST /api/events` to create an event. `POST /api/rooms` to create a 1-bed room assigned to a male. `POST /api/users` to create 1 unassigned female user.
   - **UI Action**: Navigate to `/admin/allocation?eventId=${eventId}` and click auto-allocate.
   - **Expected**: 0 allocations, female user remains unassigned.

5. **Occupancy Report Empty Boundary**
   - **API Setup**: `POST /api/events` to create an event.
   - **UI Action**: Navigate to `/admin/events/${eventId}` and click export occupancy report.
   - **Expected**: File generated contains headers only (1 line).

**NOTE TO WORKER**: Even if the backend endpoints do not exist yet, you MUST write the genuine `request.post()` code assuming standard REST endpoints (e.g. `/api/events`, `/api/rooms`, `/api/users`). Do not cheat and do not use hardcoded IDs.
