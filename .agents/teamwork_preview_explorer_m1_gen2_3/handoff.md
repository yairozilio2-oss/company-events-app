# Handoff Report: Backend Schema Fixes (Milestone 1)

## Observation
- Investigated the current Prisma schema at `c:\Users\yairo\OneDrive\Desktop\new-project\backend\prisma\schema.prisma`.
- **Finding 1:** The `Preference` model lacks an `eventId` relation, so roommate requests cannot be scoped per-event.
- **Finding 2:** There is no field for general preferences (kosher food, arrival time).
- **Finding 3:** There is no `Registration` join table. Currently, `User` is linked to `Event` only via a `roomId` on the `User` table (which also incorrectly assumes a single room per user across all events).
- **Finding 4:** The `User` model lacks authentication fields like `passwordHash`.

## Logic Chain
- Adding `passwordHash` to `User` will satisfy the missing authentication requirements.
- Creating a `Registration` model (joining `User` and `Event`) allows a user to register for an event before room allocation occurs.
- Moving the `roomId` from the `User` model to the `Registration` model correctly scopes a user's room assignment to a specific event.
- Storing general preferences (`kosherFood`, `arrivalTime`) on the `Registration` model satisfies the requirement, as these are typically event-specific preferences.
- Adding `eventId` to the `Preference` model correctly scopes roommate requests.

## Caveats
- No caveats. The proposed schema aligns cleanly with the failure feedback.

## Conclusion
The backend schema requires modifications to introduce the `Registration` model, update relations, and add missing columns. 

**Proposed `schema.prisma` implementation:**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id               Int            @id @default(autoincrement())
  email            String         @unique
  passwordHash     String
  name             String
  gender           String
  role             String         @default("employee")
  registrations    Registration[]
  sentRequests     Preference[]   @relation("Requester")
  receivedRequests Preference[]   @relation("Requested")
}

model Event {
  id            Int            @id @default(autoincrement())
  name          String
  date          DateTime
  location      String
  rooms         Room[]
  registrations Registration[]
  preferences   Preference[]
}

model Registration {
  id          Int     @id @default(autoincrement())
  userId      Int
  eventId     Int
  roomId      Int?
  kosherFood  Boolean @default(false)
  arrivalTime String? 
  
  user        User    @relation(fields: [userId], references: [id])
  event       Event   @relation(fields: [eventId], references: [id])
  room        Room?   @relation(fields: [roomId], references: [id])

  @@unique([userId, eventId])
}

model Room {
  id            Int            @id @default(autoincrement())
  capacity      Int
  gender        String         // "M", "F", or "Mixed"
  eventId       Int
  event         Event          @relation(fields: [eventId], references: [id])
  registrations Registration[]
}

model Preference {
  id          Int    @id @default(autoincrement())
  requesterId Int
  requestedId Int
  eventId     Int
  status      String @default("pending") // "pending", "approved", "rejected"
  
  requester   User   @relation("Requester", fields: [requesterId], references: [id])
  requested   User   @relation("Requested", fields: [requestedId], references: [id])
  event       Event  @relation(fields: [eventId], references: [id])

  @@unique([requesterId, requestedId, eventId])
}
```

## Verification Method
1. The implementer should replace `backend/prisma/schema.prisma` with the proposed schema.
2. Run `npx prisma format` inside the `backend/` directory to ensure syntax is valid.
3. Run `npx prisma validate` to confirm relations are correctly modeled.
4. Run `npx prisma db push` (or `npx prisma migrate dev`) to verify it successfully applies to the SQLite database.
