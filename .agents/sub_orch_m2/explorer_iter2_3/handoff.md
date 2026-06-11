# Handoff Report: M2 Employee Portal Fix Strategy

## Observation
1. **Frontend Architecture Facade**: 
   - `frontend/package.json` contains a Create React App (CRA) setup (`react-scripts` 5.0.1) without dependencies for Next.js (`next`), Tailwind, or PostCSS.
   - The application contains an active CRA entrypoint in `frontend/src/index.tsx` and `frontend/src/App.tsx`.
   - Concurrently, Next.js App Router files exist (`frontend/app/layout.tsx` with `<html lang="he" dir="rtl">` and `frontend/app/login/page.tsx`), acting as a non-functional facade.
2. **Port and Endpoint Conflicts**:
   - `frontend/app/login/page.tsx` fetches `http://localhost:3000/api/auth`.
   - `frontend/app/preferences/page.tsx` fetches `http://localhost:3001/api/preferences`.
   - `backend/src/index.ts` hardcodes the port to `process.env.PORT || 3000` and sets the auth endpoint to `/api/login` (not `/api/auth`).
   - By default, CRA and Next.js both attempt to run on port 3000, causing a conflict with the backend.
3. **Backend Authentication Vulnerability**:
   - `backend/src/index.ts` performs plaintext password comparison: `if (!user || user.passwordHash !== password)`.
   - It issues a hardcoded dummy token: `token: 'dummy-jwt-token'`.
   - `backend/package.json` lacks cryptographic dependencies like `bcrypt` (or `bcryptjs`) and `jsonwebtoken`.

## Logic Chain
- Because `package.json` uses `react-scripts`, the frontend ignores the Next.js `app/` directory entirely (including the RTL layout in `layout.tsx`), serving the CRA boilerplate instead.
- Even if the frontend correctly used Next.js, the login request would fail because it targets `/api/auth` on port `3000`, while the backend listens on `/api/login`.
- If both frontend and backend are started without `.env` overrides, both bind to port 3000, causing a fatal port collision.
- The authentication is a placebo. Without hashing, `passwordHash` in the DB is incorrectly treated as a plaintext field, compromising security. The dummy token fails to provide valid JWT state management.

## Caveats
- I did not inspect the Prisma schema directly, but I assume the `User` model contains `passwordHash` based on the backend code. 
- The strategy relies on manual package and file modifications since interactive `npm install` is disabled in the current constraints.

## Conclusion
Here is the concrete manual fix strategy to resolve the integrity violations:

**1. Fix Frontend Architecture (Migrate to Next.js)**
- Open `frontend/package.json`.
- Replace `"react-scripts": "5.0.1"` with `"next": "^14.0.0", "tailwindcss": "^3.3.0", "postcss": "^8.4.0", "autoprefixer": "^10.4.0"`.
- Update the `scripts` block to Next.js commands: 
  `"dev": "next dev", "build": "next build", "start": "next start"`.
- Delete the `frontend/src/` directory to remove the CRA code and completely rely on the `frontend/app/` router.

**2. Resolve Port and Endpoint Conflicts**
- Open `backend/src/index.ts`. Change the port assignment to: `const port = process.env.PORT || 5000;`.
- Change the login route definition from `app.post('/api/login', ...)` to `app.post('/api/auth', ...)`.
- Open `frontend/app/login/page.tsx` and change the fetch URL to `http://localhost:5000/api/auth`.
- Open `frontend/app/preferences/page.tsx` and change the fetch URL to `http://localhost:5000/api/preferences`.

**3. Implement Secure Backend Authentication**
- Open `backend/package.json` and add dependencies: `"bcryptjs": "^2.4.3", "jsonwebtoken": "^9.0.2"`. (Also add `@types/bcryptjs` and `@types/jsonwebtoken` to `devDependencies`).
- In `backend/src/index.ts`, import them:
  `import bcrypt from 'bcryptjs';`
  `import jwt from 'jsonwebtoken';`
- Update the authentication logic in `/api/auth`:
  ```typescript
  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!user || !isValid) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
  res.json({ user: safeUser, token });
  ```

## Verification Method
1. Start the backend (`npm run dev`) and frontend (`npm run dev`) simultaneously. Verify the backend binds to port 5000 and the frontend to port 3000.
2. Open `http://localhost:3000/login` in the browser and inspect the DOM to ensure `dir="rtl"` and `lang="he"` are present on the `<html>` tag.
3. Attempt to log in with valid credentials and verify a valid JWT structure is returned in the network tab, rather than a dummy token.
4. Attempt a request to `/api/preferences` and verify it successfully hits port 5000.
