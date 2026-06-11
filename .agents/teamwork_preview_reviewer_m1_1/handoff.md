# Handoff Report: Review of Milestone 1 (Backend Setup)

## 1. Observation
- `backend/package.json` includes `express`, `cors`, `dotenv`, `@prisma/client`, and appropriate devDependencies like `typescript`, `nodemon`.
- `backend/tsconfig.json` specifies `target: "es2016"`, `strict: true`.
- `backend/src/index.ts` sets up a basic Express server with CORS and JSON middleware, plus a `/api/health` endpoint.
- `backend/prisma/schema.prisma` defines `User`, `Event`, `Room`, and `Preference` models.
- In `schema.prisma`, `User` has `roomId Int?` and `room Room? @relation(...)`, enforcing a 1-to-many relationship (one user has at most one room globally).
- `Preference` model links two users (`requesterId`, `requestedId`) with a `status`, but has no relation to `Event` and no unique constraints.
- `User` model has `email`, `name`, `gender`, `role`, but lacks authentication fields (e.g., password hash).

## 2. Logic Chain
1. The project defines an `Event` model containing multiple rooms, implying support for multiple events over time.
2. Because `User` only has a single `roomId` scalar, a user cannot be assigned to rooms in different events concurrently or historically. This breaks the ability to use the system for more than one event per user.
3. Similarly, roommate requests (`Preference`) are global between two users. Without an `eventId`, Alice and Bob requesting to be roommates applies universally, preventing them from choosing different roommates for different events.
4. Without a unique constraint on `Preference`, the same user could send duplicate requests to another user, causing bugs in the M3 approval logic.
5. The interface contracts specify `/api/auth` for login/logout, but the `User` model has no fields to store credentials (like a password hash), making authentication impossible to implement securely.

## 3. Caveats
- Terminal commands to install packages or migrate the database timed out waiting for user approval, so the review was entirely static.
- "Backend setup" is minimally complete with a basic Express app, though Prisma is not yet instantiated in `index.ts`. This is acceptable for M1, but the schema flaws are critical.

## 4. Conclusion
**Verdict: REQUEST_CHANGES**

The backend boilerplate and basic setup are correct, but the Prisma schema contains fundamental logical flaws for a multi-event system. 

**Required Changes:**
1. **User-Room Relation:** Change the 1-to-many relationship to a many-to-many (e.g., `rooms Room[]` on `User` and `users User[]` on `Room`) so a user can have different rooms for different events.
2. **Event Context in Preferences:** Add `eventId` to the `Preference` model. Roommate requests must be specific to an event.
3. **Unique Constraints:** Add a composite unique constraint to `Preference`, such as `@@unique([requesterId, requestedId, eventId])`, to prevent duplicate requests.
4. **Auth Fields:** Add a `password` or `passwordHash` field to the `User` model to support the required `/api/auth` login functionality.

## 5. Verification Method
- **Schema check:** Run `npx prisma format` and `npx prisma validate` after updating `schema.prisma`.
- **Logic check:** Inspect the schema to ensure a user can belong to multiple rooms (if they belong to multiple events) and that a preference requires an event context.
