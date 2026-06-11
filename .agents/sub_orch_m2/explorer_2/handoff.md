# Handoff Report: M2 Employee Portal Implementation Strategy

## 1. Observation
- `backend/prisma/schema.prisma` exists and defines the `User`, `Event`, `Registration`, `Room`, and `Preference` models.
- `backend/prisma/dev.db` does not exist, confirming the database hasn't been generated.
- Prisma commands like `npx prisma migrate dev` can hang on interactive prompts (e.g., asking for a migration name), causing terminal timeouts in automated environments.
- The `frontend/` directory does not exist yet.
- `backend/src/index.ts` only has a `/api/health` endpoint.
- `SCOPE.md` requires frontend UI for login, preferences, and Hebrew RTL support, and backend API endpoints (`/api/login`, `/api/preferences`).

## 2. Logic Chain
1. **Prisma Timeout Fix**: To fix the Prisma DB generation timeout, non-interactive commands must be used. `npx prisma db push` synchronizes the schema with the database without asking for migration names. `npx prisma generate` then generates the Prisma Client.
2. **Frontend Setup**: Since `frontend/` is missing, we must initialize a new React or Next.js app non-interactively (e.g., `npx create-react-app frontend --template typescript` or using `create-next-app` with default flags).
3. **RTL Support**: The RTL requirement for Hebrew can be handled globally by setting `dir="rtl"` on the root `<html>` or `<body>` tag, and using CSS logical properties.
4. **Backend Endpoints**: The backend needs `PrismaClient` from `@prisma/client` initialized in `index.ts` to interact with the database. The endpoints `POST /api/login`, `GET /api/preferences`, and `PUT /api/preferences` must be wired to query/update the `User`, `Registration`, and `Preference` tables.

## 3. Caveats
- `create-react-app` or `create-next-app` commands can take a long time and might trigger timeouts themselves if not managed properly. Use non-interactive flags (`-y` or `--yes`).
- The login functionality does not specify whether JWT or session-based authentication is required. For the current scope, a simple token-based or dummy session approach might suffice.
- M1 data generation is unclear (whether dummy users exist). We may need an initialization script.

## 4. Conclusion
**Database Fix Strategy:**
- Run `cd backend` and then `npx prisma db push` (or `npx prisma migrate dev --name init`) non-interactively.
- Run `npx prisma generate` to create the Prisma Client.

**Frontend Strategy:**
- Initialize the UI non-interactively (e.g., `npx create-react-app frontend --template typescript`).
- Implement `Login` and `Preferences` views.
- Implement RTL support by applying `dir="rtl"` and `lang="he"` to the document root.

**Backend Strategy:**
- Import and instantiate `PrismaClient` in `backend/src/index.ts`.
- Expose `/api/login` checking the `User` model.
- Expose `/api/preferences` to interact with the `Registration` or `Preference` models depending on whether it's general preferences or roommate requests.

## 5. Verification Method
- **DB Check:** Run `dir backend\prisma\dev.db` to verify the SQLite file is created.
- **Frontend Check:** Verify `frontend/package.json` exists, and running the frontend locally renders RTL text.
- **Backend Check:** Send test requests to `/api/login` and `/api/preferences` using curl or similar to verify JSON responses and DB interactions.
