# Handoff Report: M2 Employee Portal Fix Strategy

## 1. Observation
- **Frontend Architecture Conflict**: `frontend/package.json` specifies a CRA setup (`"react-scripts": "5.0.1"`) without Next.js or Tailwind dependencies. However, the `frontend/app/` directory uses Next.js App Router (`layout.tsx`, `page.tsx`) and correctly implements RTL support via `lang="he" dir="rtl"`. Meanwhile, `frontend/src/` contains unused CRA files.
- **Port Conflict**: `backend/src/index.ts` defaults to port 3000 (`const port = process.env.PORT || 3000;`). `frontend/app/login/page.tsx` and `frontend/app/preferences/page.tsx` hardcode fetch requests to `http://localhost:3000/api/...`, causing the frontend to attempt requests to itself.
- **API Contract Mismatch**:
  - `backend/src/index.ts` defines `app.post('/api/login')`, but the contract in `PROJECT.md` and the frontend fetch calls expect `/api/auth`.
  - `frontend/app/preferences/page.tsx` calls `POST /api/preferences` sending `{ requesterId, eventId, requestedEmail }`, whereas `backend/src/index.ts` expects `PUT /api/preferences` and destructures `const { userId, eventId, ... } = req.body;`.
- **Backend Auth Facade**: `backend/src/index.ts` directly compares plaintext passwords: `user.passwordHash !== password` and returns a static token `'dummy-jwt-token'`. `package.json` lacks `bcrypt` or `jsonwebtoken`.

## 2. Logic Chain
- The Next.js implementation in `app/` successfully satisfies the M2 RTL requirements, making it superior to the incomplete CRA implementation in `src/`. We must align `package.json` with the Next.js setup and remove the CRA files.
- The port conflict prevents API communication. Moving the backend to `3001` and updating frontend fetch endpoints resolves this.
- API mismatches are preventing login and roommate preference features from working. We must align the HTTP verbs and payload keys between the frontend and backend.
- To resolve the auth facade without relying on interactive `npm install` commands for external dependencies, Node's built-in `crypto` module can provide functional password hashing and secure token generation.

## 3. Caveats
- Using built-in `crypto` for basic hashing and token generation is functional for fulfilling the project requirements without dependency issues, but for production, a dedicated package like `bcrypt` is standard. We are opting for `crypto` to fulfill the constraint of manual resolution without `npm install`.

## 4. Conclusion
**Concrete Fix Strategy (Actionable Steps for Implementer):**
1. **Frontend Architecture**:
   - Delete the `frontend/src` directory completely.
   - Overwrite `frontend/package.json` to include `"next"`, `"react"`, `"react-dom"`, `"tailwindcss"`, `"postcss"`, and `"autoprefixer"`. Update the scripts to: `"dev": "next dev", "build": "next build", "start": "next start"`.
2. **Resolve API & Port Conflicts**:
   - In `backend/src/index.ts`, change the port to `process.env.PORT || 3001`.
   - In `backend/src/index.ts`, rename `app.post('/api/login')` to `app.post('/api/auth')`.
   - In `frontend/app/login/page.tsx` and `frontend/app/preferences/page.tsx`, change all `http://localhost:3000` hardcoded URLs to `http://localhost:3001`.
   - In `frontend/app/preferences/page.tsx`, change the `fetch` method from `POST` to `PUT` and modify the body to send `userId` instead of `requesterId` (`body: JSON.stringify({ userId: parseInt(userId), eventId: parseInt(eventId), requestedEmail })`).
3. **Resolve Auth Facade (Using Built-in Crypto)**:
   - In `backend/src/index.ts`, import `crypto`.
   - Replace plaintext comparison with a secure hash: `crypto.createHash('sha256').update(password).digest('hex')` (Assuming test users are seeded with this, or implement `scryptSync`).
   - Replace `'dummy-jwt-token'` with `crypto.randomBytes(32).toString('hex')`.

## 5. Verification Method
- **Frontend Validation**: Run `npm install` (non-interactively) and `npm run dev` in `frontend/`. Ensure the Next.js app starts on port 3000.
- **Backend Validation**: Run `npm run dev` in `backend/`. Ensure the backend starts on port 3001.
- **E2E Request**: Log in via the frontend UI. Verify `POST http://localhost:3001/api/auth` succeeds and returns a real hex token. Submit a preference and verify `PUT http://localhost:3001/api/preferences` successfully inserts the request into the database.
