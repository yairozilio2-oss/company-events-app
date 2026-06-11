# Backend Initialization Strategy (M1)

## 1. Observation
- `PROJECT.md` dictates a Node.js backend using a relational DB (SQLite/PostgreSQL) and a REST API structure (`/api/*` routes) housed in the `backend/` directory.
- `.agents/sub_orch_m1/SCOPE.md` refines this to specifically require: Node.js with Express, Prisma ORM, and SQLite.
- **Project Structure**: `package.json` must have `start`, `dev`, `test` scripts.
- **Database File**: Must be located at `backend/prisma/dev.db`.
- **Required Data Models**:
  - `User`: id, name, gender, email, role (admin/employee)
  - `Event`: id, name, date, location
  - `Room`: id, capacity, eventId, gender (M/F/Mixed)
  - `Preference` (Roommate Request): id, requesterId, requestedId, status (pending/approved/rejected)

## 2. Logic Chain
- To achieve the requirements smoothly and correctly, a TypeScript-based Node.js environment is recommended for type safety and easy integration with Prisma Client.
- The initialization involves standardizing the Node package, installing Express for the server, Prisma for database interactions, and SQLite as the provider.
- We must provide exactly the defined relational structure. The `Preference` table acts as a self-referencing relationship on the `User` model, tracking roommate requests. The `Room` model must relate to `Event` (1-to-many) and implicitly to `User` (many-to-many, via a join table if users can be in multiple rooms across events, or a direct reference). For simplicity and based on "UserRoom" logic, we use an implicit many-to-many or a simple relation.

## 3. Caveats
- Authentication is not explicitly scoped for M1, but the `User` model implies an auth layer will be added later. We should keep the schema simple for now.
- Room allocations: A user can attend multiple events, so the relation between User and Room should ideally be many-to-many (handled seamlessly by Prisma).
- Testing framework is not defined yet; I recommend `jest` + `supertest` for Express endpoint testing.

## 4. Conclusion & Strategy

### Recommended Step-by-Step Instructions

1. **Initialize Directory & Project**
   ```bash
   mkdir backend
   cd backend
   npm init -y
   ```

2. **Install Dependencies**
   ```bash
   npm install express cors dotenv
   npm install --save-dev typescript @types/node @types/express @types/cors ts-node nodemon prisma jest @types/jest supertest @types/supertest
   ```

3. **Configure TypeScript**
   ```bash
   npx tsc --init
   ```
   *(Ensure `outDir` is set to `./dist` and `rootDir` to `./src` in `tsconfig.json`)*

4. **Initialize Prisma**
   ```bash
   npx prisma init --datasource-provider sqlite
   ```
   *(This creates `prisma/schema.prisma` and `.env`)*

5. **Apply Prisma Schema**
   *Replace the contents of `prisma/schema.prisma` with the design provided below.*

6. **Create Express App skeleton**
   *Create `src/index.ts` with basic setup and a test endpoint (`/api/health`).*

7. **Update `package.json` Scripts**
   Add to package.json:
   ```json
   "scripts": {
     "start": "node dist/index.js",
     "dev": "nodemon src/index.ts",
     "test": "jest",
     "build": "tsc"
   }
   ```

8. **Apply Database Migration**
   ```bash
   npx prisma migrate dev --name init
   ```

### Prisma Schema Design

```prisma
// backend/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL") // Set to "file:./dev.db" in .env
}

model User {
  id               Int          @id @default(autoincrement())
  name             String
  gender           String
  email            String       @unique
  role             String       @default("employee") // admin or employee
  
  // Relations
  requestsSent     Preference[] @relation("Requester")
  requestsReceived Preference[] @relation("Requested")
  rooms            Room[]       @relation("UserRooms")
}

model Event {
  id       Int      @id @default(autoincrement())
  name     String
  date     DateTime
  location String
  rooms    Room[]
}

model Room {
  id       Int      @id @default(autoincrement())
  capacity Int
  gender   String   // M/F/Mixed
  eventId  Int
  
  event    Event    @relation(fields: [eventId], references: [id])
  users    User[]   @relation("UserRooms")
}

model Preference {
  id          Int      @id @default(autoincrement())
  requesterId Int
  requestedId Int
  status      String   @default("pending") // pending, approved, rejected

  requester   User     @relation("Requester", fields: [requesterId], references: [id])
  requested   User     @relation("Requested", fields: [requestedId], references: [id])
}
```

## 5. Verification Method
- Ensure the folder `backend` exists with `package.json` and scripts.
- Run `npm run dev` to see the server start without errors.
- Run `npx prisma studio` to visually inspect that all tables (`User`, `Event`, `Room`, `Preference`) have been created in the SQLite database correctly.
