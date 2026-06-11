## Review Summary

**Verdict**: REQUEST_CHANGES

## Findings

### [Critical] Missing General Preferences Schema
- What: No schema for "arrival" or "kosher food" preferences.
- Where: `backend/prisma/schema.prisma`
- Why: `ORIGINAL_REQUEST.md` (R1) explicitly requires users to be able to set "arrival, kosher food, roommate request" preferences. The current `Preference` model only handles roommate requests.
- Suggestion: Add `kosherFood` and `arrivalTime` fields to a `Registration` model or `User` model, or create a specific `UserPreference` model.

### [Critical] Missing User-Event Registration Relation
- What: Users cannot be linked to an event unless they are assigned a room.
- Where: `backend/prisma/schema.prisma` (User and Event models)
- Why: A user has `roomId` which links to a room, which links to an event. But a user who just registered and isn't assigned a room yet has no association with the event they registered for. Waitlisted or unassigned users cannot be tracked per event.
- Suggestion: Create a `Registration` model linking `User` and `Event` with fields like `registrationDate`, and general event preferences (kosher, arrival).

### [Major] Roommate Preferences Lack Event Scoping
- What: Roommate requests are global and not tied to an event.
- Where: `backend/prisma/schema.prisma` (`Preference` model)
- Why: If the system supports multiple events, employee A might request employee B for Event 1, but this preference will incorrectly apply to Event 2 as well.
- Suggestion: Add `eventId` to the `Preference` model (which might be better named `RoommateRequest`).

## Challenge Summary

**Overall risk assessment**: HIGH

## Challenges

### [Critical] Attack scenario: Unassigned user loss
- Assumption challenged: Users are associated with events via their rooms.
- Attack scenario: Admin creates an event and 100 users register. Before auto-allocation runs, these users have no `roomId`.
- Blast radius: The system cannot list who registered for the event, making auto-allocation impossible because it doesn't know who needs a room.
- Mitigation: Implement a dedicated `Registration` junction table between User and Event.

### [Medium] Attack scenario: Mixed gender edge cases
- Assumption challenged: Room gender "Mixed" supports all constraints.
- Attack scenario: If a room is "Mixed", the system must ensure gender separation rules (R2: "employees of different genders cannot share a room") are still handled at the logic level, or that "Mixed" means it hasn't been locked to a gender yet.
- Mitigation: Document or enforce that a room's gender is dynamically set to the first assigned user's gender, rather than permanently "Mixed".

## Verified Claims
- Setup dependencies → verified via `package.json` → pass (Prisma and Express are set up)

## 5-Component Handoff Report

1. **Observation**: 
   - `schema.prisma` only links `User` to `Room` (via `roomId`). There is no `eventId` on `User` or a joining table.
   - `Preference` model only contains `requesterId`, `requestedId`, and `status`.
   - `ORIGINAL_REQUEST.md` explicitly demands "preferences (arrival, kosher food, roommate request)".
2. **Logic Chain**: 
   - Without a direct link between `User` and `Event`, the system cannot track users who have registered but not yet been assigned a room.
   - Without general preference fields, the system cannot fulfill requirement R1.
   - Without event scoping on roommate requests, requests will bleed across events.
   - Therefore, the data models do not fully satisfy Milestone 1.
3. **Caveats**: 
   - The developer might have intended to add preferences later, but M1 explicitly requires "preferences schema".
4. **Conclusion**: 
   - The schema needs fundamental structural changes before proceeding to M2. 
5. **Verification Method**: 
   - Check `schema.prisma` for a `Registration` or `UserEvent` relation, and ensure fields for kosher food/arrival time exist. Ensure roommate requests are scoped to events.
