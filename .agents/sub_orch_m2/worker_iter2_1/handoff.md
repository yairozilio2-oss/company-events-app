# M2 Employee Portal - Implementation Fixes

## Observation
- The frontend `package.json` had Create React App dependencies and scripts but the codebase is written for Next.js App Router (in `app/`).
- The backend had a hardcoded port 3000, which conflicted with the frontend's default Next.js port.
- The frontend fetch calls in `app/login/page.tsx` and `app/preferences/page.tsx` used `http://localhost:3000/api/auth` (wrong path) and `POST` for preferences (wrong method according to the backend).
- The backend login logic used a direct string comparison for password authentication and returned a plaintext dummy token (`dummy-jwt-token`).

## Logic Chain
- To allow the Next.js frontend to build and run, `frontend/package.json` was updated to remove `react-scripts` and include `next`, `tailwindcss`, `postcss`, and `autoprefixer`, with standard Next.js scripts (`dev`, `build`, `start`, `lint`).
- To avoid port collision, the backend port in `backend/src/index.ts` was updated to `3001`.
- Frontend fetch calls were refactored to point to `http://localhost:3001/api/login` and `http://localhost:3001/api/preferences`. The preferences fetch was updated to use the `PUT` method and appropriately pass `userId` instead of `requesterId` in the body payload, aligning with `req.body` destructured in the backend.
- To enforce secure authentication, `bcryptjs` and `jsonwebtoken` (along with their `@types`) were added to `backend/package.json`. In `backend/src/index.ts`, `bcrypt.compare` is now used to validate passwords against stored hashes, and `jwt.sign` securely generates an expiring JWT.

## Caveats
- Dependencies like `bcryptjs` and `jsonwebtoken` were added directly to `package.json`, but `npm install` was not executed per the task instructions. The system will need an explicit `npm install` later to resolve these modules locally.
- Unused CRA folders like `src` and `public` remain in the frontend directory but will be ignored by the Next.js build.

## Conclusion
The frontend is now correctly structured as a Next.js application, port conflicts have been bypassed, API endpoints are fully aligned, and secure authentication (using bcrypt and jsonwebtoken) replaces the placeholder logic.

## Verification Method
1. Run `npm install` in both `frontend` and `backend` directories.
2. Ensure both services can run simultaneously using `npm run dev` (backend should run on 3001, frontend on 3000).
3. Test authentication on `http://localhost:3000/login` – the login should issue a genuine JWT using bcrypt hash comparison.
4. Test roommate preference modifications on `http://localhost:3000/preferences` to ensure the PUT method is properly consumed.
