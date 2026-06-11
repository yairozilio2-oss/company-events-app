# Handoff: M1 Backend Setup & Data Models Strategy

## 1. Observation
- `PROJECT.md` dictates a Node.js/Python backend with a relational database, providing REST/GraphQL APIs (e.g., `/api/auth`, `/api/events`, `/api/preferences`, `/api/roommates`, `/api/admin/allocate`).
- `SCOPE.md` refines this to:
  - Framework: Node.js backend using Express.
  - Database: SQLite via Prisma ORM (`backend/prisma/dev.db`).
  - Required Scripts: `start`, `dev`, `test` in `backend/package.json`.
  - Required Models: User (id, name, gender, email, role), Event (id, name, date, location), Room (id, capacity, eventId, gender), Preference/Roommate Request (id, requesterId, requestedId, status).

## 2. Logic Chain
- **Init Strategy**: Start by initializing the `backend/` directory with a standard Node.js Express setup.
- **Dependencies**: Install Express, Prisma (as dev dependency), `@prisma/client`, and sqlite3. Install `jest` for the `test` script.
- **Schema Mapping**:
  - **User**: Needs a unique email, gender, role.
  - **Event**: Needs date/location.
  - **Room**: Needs a 1-to-many relationship with Event, capacity, gender.
  - **Preference**: Needs references to two Users (requester and requested) and a status string (`pending`, `approved`, `rejected`). This requires explicit Prisma relation names since there are multiple relations between `User` and `Preference`.

## 3. Caveats
- Role, Gender, and Status are logically enums, but SQLite does not support enums natively. I recommend mapping these as `String` in Prisma with application-level validation.
- Authentication tokens/passwords are not explicitly detailed in the M1 models, but might be needed later depending on how the frontend handles login.
- I am recommending a plain JavaScript setup for Express to keep initialization simple as per the `SCOPE.md`, though TypeScript could easily be substituted.

## 4. Conclusion
**Strategy & Step-by-Step Instructions**:
1. Create the `backend/` directory: `mkdir backend && cd backend`.
2. Run `npm init -y`.
3. Install core packages: `npm install express @prisma/client cors dotenv`.
4. Install dev tools: `npm install -D prisma nodemon jest supertest`.
5. Initialize Prisma: `npx prisma init --datasource-provider sqlite`.
6. Update `backend/package.json` scripts:
   - `"start": "node src/index.js"`
   - `"dev": "nodemon src/index.js"`
   - `"test": "jest"`
7. Replace `backend/prisma/schema.prisma` with the design below.
8. Apply the schema to create `dev.db`: `npx prisma db push`.
9. Create `backend/src/index.js` setting up an Express server and a healthcheck test endpoint.

**Prisma Schema Design (`backend/prisma/schema.prisma`)**:
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id                   Int          @id @default(autoincrement())
  name                 String
  email                String       @unique
  gender               String       // "M", "F", "Other"
  role                 String       @default("employee") // "admin" or "employee"
  requestsSent         Preference[] @relation("RequestsSent")
  requestsReceived     Preference[] @relation("RequestsReceived")
}

model Event {
  id       Int      @id @default(autoincrement())
  name     String
  date     DateTime
  location String
  rooms    Room[]
}

model Room {
  id       Int    @id @default(autoincrement())
  capacity Int
  gender   String // "M", "F", "Mixed"
  eventId  Int
  event    Event  @relation(fields: [eventId], references: [id])
}

model Preference {
  id          Int    @id @default(autoincrement())
  requesterId Int
  requestedId Int
  status      String @default("pending") // "pending", "approved", "rejected"

  requester   User   @relation("RequestsSent", fields: [requesterId], references: [id])
  requested   User   @relation("RequestsReceived", fields: [requestedId], references: [id])
}
```

## 5. Verification Method
1. Navigate to `backend/`.
2. Run `npm run dev` and ensure the Express server starts without errors.
3. Run `npx prisma studio` to verify that all tables (User, Event, Room, Preference) exist and match the schema.
4. Hit a test endpoint to verify Express is working.
