# Explorer Report 2 – Registration Feature Database Schema Analysis

## 1. Observation
- **Existing Prisma schema (`backend/prisma/schema.prisma`)** contains the following models relevant to registration:
  - `User` (fields: id, email, passwordHash, name, gender, role, registrations, sentRequests, receivedRequests)
  - `Event` (fields: id, name, date, location, rooms, registrations, preferences)
  - `Registration` (fields: id, userId, eventId, roomId?, kosherFood, arrivalTime, relations to User, Event, Room, unique constraint `@@unique([userId, eventId])`)
  - `Room` (fields: id, capacity, gender, eventId, relation to Event, registrations)
  - `Preference` (fields for user‑to‑user request handling – not directly part of registration)
  - `Accommodation` (unrelated to registration at present).
- **Relationships & Constraints**
  - `User 1‑* Registration`
  - `Event 1‑* Registration`
  - `Room 1‑* Registration` (optional, `roomId` nullable, onDelete `SetNull`).
  - Unique composite key on `(userId, eventId)` prevents duplicate registrations for the same event.
- **Current limitations observed**
  - No timestamps (`createdAt`, `updatedAt`) on `Registration`.
  - No explicit **status** field (e.g., pending, confirmed, cancelled).
  - No **payment** or **fee** information (if events are paid).
  - No **audit** fields (who created/updated, via which request).
  - No validation for **room capacity** or **gender restrictions** at the DB level.
  - No **waitlist** support when all rooms are full.
  - No explicit **foreign‑key cascading for room capacity** beyond `onDelete SetNull`.

## 2. Logic Chain
1. *Observation*: `Registration` already links a `User` to an `Event` and optionally a `Room`.
2. *Observation*: A unique constraint on `(userId, eventId)` enforces one registration per user per event → solves duplicate‑registration edge case.
3. *Observation*: Absence of timestamps means we cannot track when a registration was made or modified. This is critical for reporting, audit, and timeout logic.
4. *Observation*: No `status` column → cannot represent registration lifecycle (pending → confirmed → cancelled → no‑show). Without it, business logic must rely on external state, leading to inconsistency.
5. *Observation*: `roomId` is nullable and `onDelete SetNull`. If a room is removed, registrations lose their room assignment, but capacity constraints are not enforced, allowing over‑booking.
6. *Observation*: No `price` or `paymentReference` fields → if events require payment, the schema cannot capture that.
7. *Observation*: No explicit foreign‑key constraint or check for **room gender compatibility** (`User.gender` vs `Room.gender`). This is a potential mismatch edge case.
8. *Conclusion from 3‑7*: The current schema is missing several entities/columns needed for a robust registration feature: timestamps, status, payment, audit, capacity enforcement, and gender matching.
9. *Observation*: `Preference` model handles user‑to‑user requests but is unrelated to registration; no conflict detected.
10. *Conclusion*: To fully support registration, we should extend the schema with additional fields and possibly a new `RegistrationLog` or `Waitlist` model for edge cases.

## 3. Caveats
- The analysis is based solely on the current `schema.prisma` file; other application‑level constraints (e.g., in service code) may already enforce some missing rules.
- No migration history was inspected; there might be pending migrations that add the missing columns.
- Assumes the project uses SQLite (as declared) – some DB‑level checks (e.g., `CHECK` constraints) behave differently across providers.
- The `Accommodation` model is unrelated but could intersect with registration if future features tie accommodation to event attendance.

## 4. Conclusion (Actionable Recommendations)
1. **Add audit timestamps** to `Registration`:
   ```prisma
   createdAt DateTime @default(now())
   updatedAt DateTime @updatedAt
   ```
2. **Introduce a `status` enum** and column:
   ```prisma
   enum RegistrationStatus { PENDING CONFIRMED CANCELLED NO_SHOW }
   status RegistrationStatus @default(PENDING)
   ```
3. **Add optional payment fields** (if applicable):
   ```prisma
   paymentReference String?
   paid Boolean @default(false)
   ```
4. **Enforce room capacity** with a trigger or application‑level check; optionally add a `capacityUsed` field on `Room` and a `@@check` constraint (SQLite limited, may need application logic).
5. **Add gender compatibility check** via a composite `@@check` (if SQLite supports) or handle in service layer.
6. **Create a `Waitlist` model** for events where all rooms are full:
   ```prisma
   model Waitlist {
     id      Int @id @default(autoincrement())
     userId  Int
     eventId Int
     position Int @default(0)
     createdAt DateTime @default(now())
     user    User @relation(fields:[userId], references:[id])
     event   Event @relation(fields:[eventId], references:[id])
     @@unique([userId, eventId])
   }
   ```
7. **Document constraints** in `README`/`PROJECT.md` and update migration scripts accordingly.

## 5. Verification Method
- Run `npx prisma migrate dev --name add_registration_audit` (or equivalent) after applying the above schema changes.
- Verify generated SQL includes the new columns, enum, and constraints.
- Write a unit test that attempts to create two `Registration` records with the same `(userId, eventId)` and assert a uniqueness violation.
- Write a test that creates a `Registration` with `status = CONFIRMED` and checks `createdAt`/`updatedAt` are populated.
- (Optional) Attempt to insert a `Registration` with a `Room` whose capacity is already exceeded; ensure the application rejects it (or DB constraint fires if implemented).

---
*Report generated by the explorer sub‑agent.*
