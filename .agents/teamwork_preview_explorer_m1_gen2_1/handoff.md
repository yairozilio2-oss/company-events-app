# Handoff Report

## Observation
I examined the requirements in `PROJECT.md` and `SCOPE.md` along with the current `backend/prisma/schema.prisma`. 
- The `User` model currently lacks a `passwordHash` field for authentication.
- The `User` model has a direct `roomId` relation, which means a user can only ever have one room across all events globally.
- There is no direct relation between `User` and `Event` to indicate attendance without room assignment.
- The `Preference` model acts as a roommate request but lacks an `eventId`, meaning roommate requests are currently global, not per-event.
- There are no fields storing general preferences like kosher food or arrival time.

## Logic Chain
1. **User Authentication**: To fix the missing authentication fields, we must add `passwordHash String` to the `User` model.
2. **User-Event Relation & General Preferences**: The lack of a User-Event relation and the global room assignment issue can be solved by introducing a `Registration` join table. This table will link a `User` to an `Event`. 
   - Moving the `roomId` to the `Registration` table allows users to have different rooms for different events.
   - The `Registration` table is the ideal place to store event-specific general preferences like `kosherFood` (Boolean) and `arrivalTime` (String).
3. **Roommate Requests per Event**: Adding an `eventId` to the `Preference` model ensures that a roommate request is scoped to a particular event. We also need to define a relation to the `Event` model.

## Caveats
- I assumed that general preferences (`kosherFood`, `arrivalTime`) are event-specific and thus belong on the `Registration` model rather than being global to the `User`.
- The `Preference` model retains its name but specifically handles roommate requests. Consider renaming it to `RoommateRequest` in the future for clarity, though I kept it as `Preference` to align with the current `SCOPE.md`.
- Default values for the new authentication fields (if migrating an existing DB) might require a multi-step migration.

## Conclusion
The recommended fix strategy involves:
1. Adding `passwordHash` to `User`.
2. Creating a `Registration` model that links `User` and `Event`, and moving `roomId` from `User` to `Registration`.
3. Adding `kosherFood` and `arrivalTime` fields to `Registration`.
4. Adding `eventId` and its relation to `Preference`.

### Updated Prisma Schema
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id               Int          @id @default(autoincrement())
  email            String       @unique
  passwordHash     String
  name             String
  gender           String
  role             String       @default("employee")
  
  registrations    Registration[]
  sentRequests     Preference[] @relation("Requester")
  receivedRequests Preference[] @relation("Requested")
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
  id          Int      @id @default(autoincrement())
  userId      Int
  eventId     Int
  roomId      Int?
  
  // General Preferences
  kosherFood  Boolean  @default(false)
  arrivalTime String?

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  event       Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  room        Room?    @relation(fields: [roomId], references: [id], onDelete: SetNull)

  @@unique([userId, eventId])
}

model Room {
  id            Int            @id @default(autoincrement())
  capacity      Int
  gender        String         // "M", "F", or "Mixed"
  eventId       Int
  
  event         Event          @relation(fields: [eventId], references: [id], onDelete: Cascade)
  registrations Registration[]
}

model Preference {
  id          Int    @id @default(autoincrement())
  requesterId Int
  requestedId Int
  eventId     Int
  status      String @default("pending") // "pending", "approved", "rejected"
  
  requester   User   @relation("Requester", fields: [requesterId], references: [id], onDelete: Cascade)
  requested   User   @relation("Requested", fields: [requestedId], references: [id], onDelete: Cascade)
  event       Event  @relation(fields: [eventId], references: [id], onDelete: Cascade)

  @@unique([requesterId, requestedId, eventId])
}
```

## Verification Method
1. Copy the updated schema into `backend/prisma/schema.prisma`.
2. Run `npx prisma format` to ensure syntax correctness.
3. Run `npx prisma db push` or `npx prisma migrate dev` to verify the schema generates valid SQL tables and relations in SQLite.
4. Verify the database tables using a SQLite viewer to confirm `Registration` connects users and events correctly with the preference fields.
