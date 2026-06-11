# Handoff Report: M2 Employee Portal Strategy & Prisma Fix

## 1. Observation
- **Prisma Issue**: The file `backend/prisma/schema.prisma` exists and is configured for SQLite (`DATABASE_URL="file:./dev.db"`). However, the SQLite database `dev.db` is missing. The terminal timeouts during generation were likely caused by interactive prompts when running `prisma migrate dev` or `prisma db push`, which wait indefinitely for user input in a headless/automated terminal.
- **Backend State**: `backend/src/index.ts` currently only has a `/api/health` route. The required M2 routes (`/api/login`, `/api/preferences` GET/PUT) are missing.
- **Frontend State**: There is no `frontend/` directory in the project root (`c:/Users/yairo/OneDrive/Desktop/new-project/`).

## 2. Logic Chain
- **Prisma Fix**: To prevent terminal timeouts, Prisma commands must be run non-interactively. Instead of `migrate dev` which can prompt for resets or migration names, we should use `npx prisma db push --accept-data-loss` (or `npx prisma migrate dev --name init` if migrations are strictly needed) to automatically sync the schema and avoid blocking the terminal.
- **Backend Endpoints**: The Prisma Client must be generated (`npx prisma generate`) and imported into `index.ts`. We then need to implement POST `/api/login` (for authentication, likely JWT) and GET/PUT `/api/preferences` (to read/update the `Registration` and `Preference` models).
- **Frontend Bootstrap**: Since the frontend does not exist, we must initialize a new React or Next.js application in a `frontend/` folder.
- **Hebrew RTL Support**: To support RTL correctly, the frontend application needs global RTL attributes (`<html lang="he" dir="rtl">`) and an RTL-aware styling framework (like Tailwind CSS with logical properties `ms-`, `me-`, `ps-`, `pe-`).

## 3. Caveats
- The authentication mechanism (e.g., JWT vs sessions) is not strictly defined in `SCOPE.md`. I will assume standard JWT for stateless API communication.
- The exact UI framework is unspecified, but `PROJECT.md` mentions React/Next.js. Next.js or Vite+React are appropriate.
- I haven't modified the backend files as my role is read-only exploration.

## 4. Conclusion
**Prisma Fix Strategy**:
1. Navigate to the backend directory: `cd backend`
2. Run `npx prisma db push` to generate the SQLite database without interactive prompts.
3. Run `npx prisma generate` to create the Prisma Client.

**M2 Implementation Strategy**:
1. **Backend**: 
   - Initialize `@prisma/client` in `backend/src/index.ts`.
   - Implement `POST /api/login` (authenticates `User` and returns JWT).
   - Implement `GET /api/preferences` and `PUT /api/preferences` (fetches/updates user preferences and registrations).
2. **Frontend**:
   - Bootstrap a React app in `frontend/`.
   - Set `dir="rtl"` and `lang="he"` in the base HTML.
   - Create Login and Preferences views using RTL-friendly CSS (e.g., Tailwind).
   - Integrate with the backend API.

## 5. Verification Method
- **Prisma**: Run `cd backend && npx prisma db push && npx prisma generate`. Check that `dev.db` is created in `backend/` and no prompts block the terminal.
- **Backend**: Start the server `npm run dev` and test the new endpoints using `curl` or Postman.
- **Frontend**: Run the dev server, navigate to the local URL, and verify Hebrew text renders right-to-left.
