# M2 Employee Portal - Implementation Fix Strategy

## Observation
1. **Frontend Architecture Mismatch**: The `frontend/package.json` relies on `react-scripts` (Create React App), but the actual implementation uses Next.js App Router (`app/layout.tsx`, `app/login/page.tsx`, `app/preferences/page.tsx`) with Tailwind CSS classes. CRA's `src` folder also exists alongside `app`.
2. **Port Conflict**: The backend is hardcoded to port 3000 (`const port = process.env.PORT || 3000;` in `backend/src/index.ts`). Next.js also defaults to port 3000, causing a conflict if both are run simultaneously.
3. **API Endpoint Mismatches**: 
   - `app/login/page.tsx` makes a POST request to `http://localhost:3000/api/auth`, but the backend defines the route as `POST /api/login`.
   - `app/preferences/page.tsx` makes a POST request to `http://localhost:3000/api/preferences`, but the backend defines it as `PUT /api/preferences`.
4. **Insecure Authentication**: The backend login endpoint (`backend/src/index.ts`) does a direct string comparison (`user.passwordHash !== password`) and returns a hardcoded dummy token (`{ token: 'dummy-jwt-token' }`).
5. **RTL Support**: Hebrew RTL is partially configured correctly in `app/layout.tsx` (`<html lang="he" dir="rtl">`) and Next.js pages, but because Next.js isn't actually configured in `package.json`, this layout is never loaded by the current CRA setup.

## Logic Chain
- The mismatch between `package.json` (CRA) and the codebase (Next.js) means the application cannot be started or built correctly. Converting the `package.json` to Next.js is the most logical path since the UI files (`app/` directory) are already written in the Next.js App Router paradigm.
- To resolve the port conflict, one of the services must change its default port. Changing the backend to 3001 is standard practice.
- The frontend API calls must be updated to match the backend's port and route definitions, otherwise fetch requests will fail with 404 Not Found or Method Not Allowed.
- Plaintext password comparison and dummy JWTs defeat the purpose of authentication and must be replaced with cryptographic hashing and actual JWT generation.

## Caveats
- I did not verify if the database schema in Prisma correctly supports the data types being sent by the frontend, though they appear to match.
- This strategy assumes the intention was to use Next.js (based on the presence of the `app/` directory). If CRA was the strict requirement, the strategy would involve deleting `app/` and migrating the logic back to `src/`.

## Conclusion
The implementation is currently non-functional due to a mix of CRA configuration with Next.js code, hardcoded backend ports causing conflicts, API path/method mismatches, and insecure dummy authentication. A concrete, manual refactoring strategy is required to align the configuration with the code and secure the backend.

### Concrete Fix Strategy (Manual Refactoring)
1. **Refactor Frontend Configuration to Next.js**:
   - Update `frontend/package.json`: Remove `react-scripts`. Add `next`, `tailwindcss`, `postcss`, and `autoprefixer`. Update the `scripts` section to use `"dev": "next dev"`, `"build": "next build"`, and `"start": "next start"`.
   - Delete the unused `frontend/src` and `frontend/public` directories to avoid confusion and enforce the Next.js App Router structure.
2. **Resolve Port Conflicts & API Mismatches**:
   - In `backend/src/index.ts`, change the port fallback to 3001: `const port = process.env.PORT || 3001;`.
   - In `frontend/app/login/page.tsx`, change the fetch URL to `http://localhost:3001/api/login`.
   - In `frontend/app/preferences/page.tsx`, change the fetch URL to `http://localhost:3001/api/preferences` and change the method from `POST` to `PUT`.
3. **Implement Secure Authentication**:
   - Add `bcryptjs` and `jsonwebtoken` (and their `@types` counterparts) to `backend/package.json`.
   - In `backend/src/index.ts`, replace the plaintext password comparison with `await bcrypt.compare(password, user.passwordHash)`.
   - Replace the dummy token with a real token using `jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' })`.

## Verification Method
1. **Configuration**: Run `npm run build` in the `frontend` directory. It should successfully compile a Next.js application.
2. **Runtime**: Start the backend (`npm run dev`) and frontend (`npm run dev`). Verify the backend runs on `3001` and the frontend on `3000`.
3. **Integration**: Navigate to `http://localhost:3000/login`, enter credentials, and ensure the request hits `http://localhost:3001/api/login` and returns a real JWT. Check the preferences page to ensure the `PUT` request succeeds.
