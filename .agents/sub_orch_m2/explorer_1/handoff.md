# Handoff Report: M2 Employee Portal Implementation Strategy

## Observation
- **Backend**: The `backend/` directory contains an Express server (`src/index.ts`) and a valid Prisma schema (`backend/prisma/schema.prisma`).
- **Prisma Database**: The user stated that the Prisma database was not generated due to terminal timeouts.
- **Frontend**: The `frontend/` directory specified in `PROJECT.md` does not currently exist.
- **Contracts**: `SCOPE.md` specifies `POST /api/login`, `GET /api/preferences`, and `PUT /api/preferences`, while `PROJECT.md` mentions `/api/auth` and `/api/preferences`.

## Logic Chain
1. **Prisma Timeout Fix**: To bypass terminal timeouts, the implementer should run Prisma commands (like `npx prisma db push` or `npx prisma migrate dev --name init`) using asynchronous command execution (e.g., setting `WaitMsBeforeAsync` parameter to a small value, like `500`) to let it run in the background.
2. **Backend API endpoints**: Add routes to `backend/src/index.ts` to support the required endpoints:
   - `POST /api/login` (or `/api/auth`): basic authentication endpoint.
   - `GET /api/preferences` & `PUT /api/preferences`: endpoints to fetch and update employee preferences using Prisma queries.
3. **Frontend Initialization**: Since `frontend/` doesn't exist, use `npx create-next-app@latest frontend` or `npx create-react-app frontend` in the project root to scaffold the UI.
4. **UI & RTL Support**: Add global styling to the frontend to support Hebrew Right-To-Left (RTL). This can be done by setting `<html dir="rtl" lang="he">` and using CSS logical properties. Build the Login and Preferences forms to interact with the Express backend APIs.

## Caveats
- No specific frontend framework was explicitly enforced, though `PROJECT.md` suggests React/Next.js. The implementer can choose.
- Authentication mechanism (JWT vs sessions) isn't specified, so a simple token or session-based approach should be used.

## Conclusion
The implementation strategy involves three steps:
1. Generate the Prisma database by running `npx prisma db push` with the command tool's `WaitMsBeforeAsync` configuration set to a low value to avoid timeout.
2. Implement backend Express endpoints (`/api/login`, `/api/preferences`) using the generated Prisma client.
3. Bootstrap the `frontend/` directory with a React/Next.js app, configure it for Hebrew RTL (`dir="rtl"`), and build the Login and Preferences UI components.

## Verification Method
- Run `cd backend && npx prisma studio` (or verify SQLite DB file exists) to confirm the database was generated.
- Call the backend endpoints directly using `curl` or tests.
- Ensure the `frontend/` directory is created and successfully builds/runs using `npm run dev`.
