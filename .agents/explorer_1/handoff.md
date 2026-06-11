# Handoff Report: Backend Compilation and Integrity Fix Strategy

## 1. Observation
- **Missing `app` Initialization**: In `backend/src/index.ts`, the line `const app = express();` is completely missing. On line 59, `app.use(cors());` attempts to use `app` without initialization, causing compilation and runtime errors.
- **Dependency Issue**: In `backend/package.json`, `@types/validator` is listed under `dependencies` (line 21) instead of `devDependencies`.
- **Integrity Violations (Facades)**:
  - In `backend/src/index.ts` (lines 44-57), an in-memory array `let accommodations: Accommodation[] = [];` is used to store data.
  - The endpoints `/api/accommodations` (GET, POST, PUT, DELETE) manipulate this in-memory array instead of leveraging Prisma (lines 240-262).
  - `POST /api/roommates` (line 265) contains `// Placeholder logic: echo back validated data` and only returns the validated input.
  - `POST /api/allocate` (line 278) contains `// Placeholder logic: acknowledge allocation` and only returns the validated input.
- **Prisma Schema Constraints**: In `backend/prisma/schema.prisma`, `Accommodation` model defines `photos` and `amenities` as `String` type. The `Preference` model links `requesterId`, `requestedId`, and `eventId`. The `Registration` model links `userId`, `eventId`, and `roomId`.

## 2. Logic Chain
1. **Compilation Error (`app`)**: Without `const app = express();`, the TypeScript compiler throws an error because `app` is implicitly `any` or undeclared, and Node.js will crash at runtime. Adding it back before middleware registration resolves this.
2. **Compilation Error (`@types/validator`)**: TypeScript type definitions should reside in `devDependencies`. Fixing the package configuration and running `npm install` resolves module resolution issues.
3. **Removing Facades (Accommodations)**: The in-memory array must be removed. The endpoints should use `prisma.accommodation.findMany`, `create`, `update`, and `delete`. Since the incoming requests use string arrays for `photos` and `amenities`, but Prisma expects `String`, we must serialize them with `JSON.stringify()` on write and `JSON.parse()` on read.
4. **Removing Facades (Roommates)**: The `POST /api/roommates` endpoint receives `userId`, `eventId`, and `preferences` (an array of emails). It should look up users by these emails and create `Preference` records in the database with `status: 'pending'`.
5. **Removing Facades (Allocate)**: The `POST /api/allocate` endpoint receives an array of allocations mapping `roommateId` to `accommodationId` (which maps to `roomId` in the schema). It should update the existing `Registration` records to set `roomId` using Prisma.

## 3. Caveats
- It is assumed that `accommodationId` in the `/api/allocate` payload corresponds to `roomId` in the `Registration` model.
- We assume that `photos` and `amenities` can be safely stored as JSON strings in the Prisma `String` fields.

## 4. Conclusion
To resolve the issues, the implementer must execute the following step-by-step strategy:
1. **Add Express App**: Insert `const app = express();` directly above `app.use(cors());` in `backend/src/index.ts`.
2. **Fix Dependencies**: Run `npm install -D @types/validator` in the `backend/` directory to move it to `devDependencies` and ensure it is properly installed.
3. **Refactor Accommodations Endpoints**: Replace the in-memory array logic in `/api/accommodations` with Prisma calls (`prisma.accommodation.*`), ensuring `photos` and `amenities` are properly JSON-stringified/parsed.
4. **Refactor Roommates Endpoint**: Update `POST /api/roommates` to query users by email from the `preferences` array and `prisma.preference.create()` records for each request.
5. **Refactor Allocate Endpoint**: Update `POST /api/allocate` to use `prisma.$transaction` to loop through allocations and `prisma.registration.update()` the `roomId` for each corresponding `userId` (`roommateId`) and `eventId`.

## 5. Verification Method
- **Command to Verify Types**: Run `npm run build` or `npx tsc` inside `backend/` to ensure no TypeScript errors occur.
- **File Inspection**: Check `backend/src/index.ts` to confirm there are no `// Placeholder logic` comments and no in-memory `accommodations` array.
- **Code Functionality**: Confirm that `/api/accommodations`, `/api/roommates`, and `/api/allocate` all use `prisma.*` methods inside their implementations.
