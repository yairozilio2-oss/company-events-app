# Handoff Report: M1 Backend Setup Strategy & Data Models

## Observation
- **PROJECT.md** (Lines 4-13) requires a Node.js backend with SQLite, defining REST/GraphQL API for client-server communication. Milestone M1 targets backend setup and data models for Users, events, rooms, and preferences.
- **SCOPE.md** (Lines 15-22) specifies creating a project structure inside the `backend/` directory, implementing Express, using Prisma for the ORM, and setting up the database at `backend/prisma/dev.db` (or `backend/database.sqlite`). 
- Required models detailed in **SCOPE.md**:
  - `User`: id, name, gender, email, role.
  - `Event`: id, name, date, location.
  - `Room`: id, capacity, eventId, gender.
  - `Preference`: id, requesterId, requestedId, status (pending/approved/rejected).

## Logic Chain
1. **Backend Initialization**: To fulfill the requirements, the backend should be initialized with npm, Express, TypeScript (recommended for Prisma), and Prisma CLI.
2. **Prisma Setup**: Using `npx prisma init --datasource-provider sqlite` will generate the `prisma/schema.prisma` file and configure the SQLite environment.
3. **Schema Design**: 
   - `User` needs relations to `Preference` (as both requester and requested) to support roommate selection.
   - `Room` belongs to an `Event`, and can contain multiple `User`s (roommates).
   - `Preference` maps two `User`s together and tracks approval status.

## Caveats
- Authentication is not fully detailed in the schema yet (e.g., passwords or SSO). The model focuses only on the fields defined in SCOPE.md.
- TypeScript is assumed for Express to work cleanly with the Prisma Client, providing strong type safety.

## Conclusion

### Strategy & Step-by-Step Instructions
1. **Initialize Directory**: `mkdir backend && cd backend`
2. **Initialize Node**: `npm init -y`
3. **Install Dependencies**: `npm install express cors dotenv @prisma/client`
4. **Install Dev Dependencies**: `npm install -D typescript @types/node @types/express ts-node nodemon prisma`
5. **Init TypeScript**: `npx tsc --init` (Configure `outDir` to `./dist` and `rootDir` to `./src`)
6. **Init Prisma**: `npx prisma init --datasource-provider sqlite`
7. **Define Schema**: Update `backend/prisma/schema.prisma` with the models provided below.
8. **Create Database**: Run `npx prisma migrate dev --name init` to generate the SQLite DB file at `backend/prisma/dev.db`.
9. **Express Setup**: Create `backend/src/index.ts` with a basic Express app setup, testing an endpoint (e.g., `/api/health`).
10. **Scripts Setup**: Update `backend/package.json` with scripts:
    - `"start": "node dist/index.js"`
    - `"dev": "nodemon src/index.ts"`
    - `"test": "echo \"Error: no test specified\" && exit 1"`

### Prisma Schema Design (`schema.prisma`)
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id             Int          @id @default(autoincrement())
  email          String       @unique
  name           String
  gender         String
  role           String       @default("employee")
  roomId         Int?
  room           Room?        @relation(fields: [roomId], references: [id])
  sentRequests   Preference[] @relation("Requester")
  receivedRequests Preference[] @relation("Requested")
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
  gender   String // "M", "F", or "Mixed"
  eventId  Int
  event    Event  @relation(fields: [eventId], references: [id])
  users    User[]
}

model Preference {
  id          Int    @id @default(autoincrement())
  requesterId Int
  requestedId Int
  status      String @default("pending") // "pending", "approved", "rejected"
  requester   User   @relation("Requester", fields: [requesterId], references: [id])
  requested   User   @relation("Requested", fields: [requestedId], references: [id])
}
```

## Verification Method
1. Ensure the generated database file exists at `backend/prisma/dev.db`.
2. Run `npx prisma validate` inside the `backend` folder to ensure the schema has no syntax errors.
3. Run `npm run dev` to verify the Express server boots successfully and Prisma client connects.
