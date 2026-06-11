# Handoff Report: Prisma Schema Fixes

## Observation
- Investigated `c:\Users\yairo\OneDrive\Desktop\new-project\backend\prisma\schema.prisma`.
- The `Preference` model lacks an `eventId` field.
- The `User` model lacks a `passwordHash` field.
- The `User` model has a direct relation to `Room` (`roomId`), but no relation to `Event` or event-specific registrations.
- Missing general preferences such as kosher food or arrival time.

## Logic Chain
- Roommate requests (`Preference`) happen in the context of an event, so they must contain `eventId`.
- A user can register for an event and specify general preferences (kosher food, arrival time) before being assigned a room. This requires a `Registration` join table between `User` and `Event`.
- Users are assigned to rooms per event, so the `roomId` should be moved from `User` to `Registration`.
- A user needs `passwordHash` in the `User` model for authentication as specified.

## Caveats
- No caveats found, the missing requirements map directly to the `Registration` and updated models.

## Conclusion
The `schema.prisma` should be updated to introduce the `Registration` model, which holds event-specific user details (room, general preferences). The `Preference` model must include `eventId`. The `User` model needs the `passwordHash` field and should remove the global `roomId` field in favor of `Registration.roomId`.
I've written the proposed schema to `c:\Users\yairo\OneDrive\Desktop\new-project\.agents\teamwork_preview_explorer_m1_gen2_2\proposed_schema.prisma`.

## Verification Method
1. Replace `backend/prisma/schema.prisma` with the proposed changes.
2. Run `npx prisma format` and `npx prisma validate` inside the `backend/` directory to verify syntax correctness.
