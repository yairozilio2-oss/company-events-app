# Registration Feature Database Schema Analysis

## Overview
The current Prisma schema (see `backend/prisma/schema.prisma`) already defines a `Registration` model that captures a user's enrollment in an event, with optional room assignment and several preference fields. This analysis identifies the existing tables, fields, relationships, constraints, and suggests enhancements for performance and data integrity.

---

## 1. Existing Tables Related to Registration
| Model | Primary Key | Fields | Relations | Constraints |
|-------|-------------|--------|-----------|-------------|
| **User** | `id` (Int, autoincrement) | `email`, `passwordHash`, `name`, `gender`, `role` | `registrations` (1‑many → Registration), `sentRequests` / `receivedRequests` (Preference) | `email` is `@unique` |
| **Event** | `id` | `name`, `date`, `location` | `rooms` (1‑many → Room), `registrations` (1‑many → Registration), `preferences` (1‑many → Preference) | – |
| **Room** | `id` | `capacity`, `gender`, `eventId` | `event` (many‑to‑1 → Event), `registrations` (1‑many → Registration) | – |
| **Registration** | `id` | `userId`, `eventId`, `roomId?`, `kosherFood`, `arrivalTime` | `user` (many‑to‑1 → User), `event` (many‑to‑1 → Event), `room` (optional many‑to‑1 → Room) | `@@unique([userId, eventId])` (prevent duplicate registrations) |
| **Preference** | `id` | `requesterId`, `requestedId`, `eventId`, `status` | `requester` / `requested` (User), `event` (Event) | `@@unique([requesterId, requestedId, eventId])` |
| **Accommodation** | `id` | `title`, `description`, `price`, `capacity`, `address`, `photos`, `amenities` | – | – |

---

## 2. Required Additions / Modifications
| Area | Recommendation | Rationale |
|------|----------------|-----------|
| **Registration Indexes** | Add composite index on `(eventId, roomId)` and a separate index on `kosherFood` | Queries frequently filter registrations by event and optionally by room or dietary preference. Indexes speed up these look‑ups. |
| **Foreign Key Cascades** | Ensure `onDelete: Cascade` for `roomId` is appropriate; consider `SetNull` (already set) to keep registration history when a room is removed. | Maintains referential integrity without orphaned rows. |
| **Timestamp Columns** | Add `createdAt` and `updatedAt` fields (`DateTime @default(now()) @updatedAt`) to `Registration` (and other core tables). | Auditing, debugging, and pruning stale data. |
| **Status Enum** | Replace the string `status` in `Preference` with an `enum PreferenceStatus { pending approved rejected }`. | Prevents typo‑related bugs and enables efficient indexing. |
| **Unique Constraint on (userId, eventId, roomId?)** | If a user should not register multiple times for the same room, extend the unique constraint accordingly. | Enforces business rule (optional). |
| **Full‑Text Search** | If searching registrations by `arrivalTime` (string) or notes (future field), consider adding a `Text` column with full‑text index. | Improves search performance. |

---

## 3. Performance Considerations
1. **Index Strategy**
   - Primary key (`id`) is already indexed.
   - `@@unique([userId, eventId])` provides an index for the common lookup `WHERE userId = ? AND eventId = ?`.
   - **Recommended composite index**: `@@index([eventId, roomId])` to accelerate queries that fetch all registrations for an event, optionally grouped by room.
   - **Recommended single‑column index**: `@@index([kosherFood])` if filtering by dietary preference is frequent.
2. **Selectivity**
   - `roomId` is nullable; the composite index improves queries that filter on `eventId` *and* restrict to non‑null `roomId`.
3. **Query Patterns**
   - Typical queries: `registrations for a given event`, `user's registrations across events`, `room occupancy count`. Ensure indexes cover these patterns.
4. **Database Size**
   - Using SQLite for development; for production consider PostgreSQL or MySQL to benefit from advanced indexing (GIN, BRIN). Migration scripts should be prepared.
5. **Batch Operations**
   - For bulk registration imports, disable indexes temporarily or use `INSERT ... ON CONFLICT DO NOTHING` to respect the unique constraint.

---

## 4. Suggested Prisma Schema Updates
```prisma
model Registration {
  id          Int      @id @default(autoincrement())
  userId      Int
  eventId     Int
  roomId      Int?
  kosherFood  Boolean  @default(false)
  arrivalTime String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  event  Event  @relation(fields: [eventId], references: [id], onDelete: Cascade)
  room   Room?  @relation(fields: [roomId], references: [id], onDelete: SetNull)

  @@unique([userId, eventId])
  @@index([eventId, roomId])
  @@index([kosherFood])
}

enum PreferenceStatus {
  pending
  approved
  rejected
}

model Preference {
  id          Int    @id @default(autoincrement())
  requesterId Int
  requestedId Int
  eventId     Int
  status      PreferenceStatus @default(pending)

  requester User @relation("Requester", fields: [requesterId], references: [id], onDelete: Cascade)
  requested User @relation("Requested", fields: [requestedId], references: [id], onDelete: Cascade)
  event     Event @relation(fields: [eventId], references: [id], onDelete: Cascade)

  @@unique([requesterId, requestedId, eventId])
}
```

---

## 5. Migration Impact
- Adding indexes and timestamp columns is **non‑breaking** for existing data.
- Introducing the `PreferenceStatus` enum requires a data migration: map existing string values to the enum (e.g., `'pending'` → `pending`).
- Updating unique constraints should be preceded by a data cleanup to eliminate duplicate `(userId, eventId)` rows.

---

## 6. Verification Method
1. Run `npx prisma migrate dev` to apply schema changes locally.
2. Execute benchmark queries (e.g., `SELECT * FROM Registration WHERE eventId = ?;`) before and after migration, measuring execution time.
3. Verify that the unique constraint prevents duplicate registrations.
4. Confirm that timestamps are auto‑populated on insert and update.
5. Run the existing test suite (`npm test` or `yarn test`) to ensure no regression.

---

*Prepared by the explorer sub‑agent.*
