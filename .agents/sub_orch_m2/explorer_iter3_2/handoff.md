# Handoff Report: M2 Employee Portal Investigation

## 1. Observation
- **API Endpoint Mismatch:**
  - `backend/src/index.ts` (line 22): `app.post('/api/login', async (req: Request, res: Response) => {`
  - `frontend/app/login/page.tsx` (line 12): `const res = await fetch('http://localhost:3001/api/login', {`
- **Frontend Data Structure Bug:**
  - `frontend/app/preferences/page.tsx` (line 41): `setPreferences(data.sent || []);`
  - `backend/src/index.ts` (line 64) responds to `/api/preferences` with: `res.json({ registration, roommateRequests: { sent, received } });`
- **Leftover CRA Files:**
  - `c:\Users\yairo\OneDrive\Desktop\new-project\frontend\src` contains `App.tsx` and `index.tsx`.
  - `c:\Users\yairo\OneDrive\Desktop\new-project\frontend\public` contains `index.html`.
  - The correct Next.js structure being used is at `frontend/app/`.
- **RTL Support Verification:**
  - `frontend/app/layout.tsx` (line 15) correctly defines `<html lang="he" dir="rtl">`.
  - Email and password input fields in login/preferences correctly override this to `dir="ltr"` for English input.

## 2. Logic Chain
1. The backend server and frontend client are currently bound to the `/api/login` path. To meet the specified requirement, both must be updated to use `/api/auth`.
2. The preferences frontend fails to load the sent roommate requests because it looks for `data.sent`. The backend encapsulates this list inside `roommateRequests.sent`. Changing `data.sent` to `data.roommateRequests?.sent` on the frontend aligns the consumer with the producer's data shape.
3. The existence of `frontend/src/App.tsx`, `frontend/src/index.tsx`, and `frontend/public/index.html` indicates incomplete migration from Create React App to Next.js App Router (since the Next.js routes already exist in `frontend/app`). These legacy files cause clutter and confusion and should be deleted.
4. RTL support is correctly implemented at the layout level and properly scoped in the input forms, so no further changes are needed for `dir` or `lang` attributes.

## 3. Caveats
- I did not run the application or compile it locally, as my role is limited to read-only investigation.
- I assumed the entire `frontend/src` and `frontend/public` directories are safe to delete. If there are static assets (e.g., images) in `frontend/public` that Next.js might still need, only `index.html` should be removed. However, my inspection only showed `index.html` inside `public`, making it safe to delete.

## 4. Conclusion
To resolve the M2 issues, execute the following fix strategy:
1. **Rename Endpoints**: In `backend/src/index.ts`, change `app.post('/api/login', ...)` to `app.post('/api/auth', ...)`. In `frontend/app/login/page.tsx`, change the fetch URL from `/api/login` to `/api/auth`.
2. **Fix Data Access**: In `frontend/app/preferences/page.tsx`, modify line 41 from `setPreferences(data.sent || []);` to `setPreferences(data.roommateRequests?.sent || []);`.
3. **Clean Up CRA Leftovers**: Delete the `frontend/src` and `frontend/public` directories entirely to remove CRA traces.

## 5. Verification Method
- **Endpoints**: Run `grep_search` or `Select-String` for `/api/login` in the workspace to confirm 0 results, and for `/api/auth` to confirm 2 results.
- **Preferences API**: Start the backend and frontend. Visit the preferences page, and successfully load requests without console errors.
- **Leftover Files**: Verify `ls frontend/src` and `ls frontend/public` return "does not exist".
