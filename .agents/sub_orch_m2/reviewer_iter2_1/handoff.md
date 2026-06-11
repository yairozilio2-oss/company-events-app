## Review Summary

**Verdict**: REQUEST_CHANGES

## Findings

### Critical Finding 1: Security Bypass & Unused JWT
- What: The frontend receives the JWT from login but discards it without storing it. Furthermore, the backend's `/api/preferences` endpoint does not require or verify the JWT, trusting the `userId` passed in the query/body directly.
- Where: `frontend/app/login/page.tsx` (ignores token), `backend/src/index.ts` (missing JWT middleware on protected routes).
- Why: This completely defeats the purpose of the newly implemented JWT/bcrypt authentication, acting as a facade for security while actually allowing any user to view or modify any other user's preferences by simply changing the `userId` parameter.
- Suggestion: Store the token in the frontend (e.g., localStorage), send it via `Authorization` headers in subsequent fetch calls, and add a backend middleware to verify the JWT and extract `userId` from it rather than trusting the client payload.

### Major Finding 2: API Endpoint Mismatch
- What: The login endpoint is implemented as `/api/login`, but the task scope explicitly requires `/api/auth`.
- Where: `backend/src/index.ts` and `frontend/app/login/page.tsx`.
- Why: Violates the interface contract defined in the requirements.
- Suggestion: Rename the endpoint to `/api/auth` in both the backend router and frontend fetch call.

### Major Finding 3: Bug in Preferences Data Retrieval
- What: The frontend attempts to read `data.sent` from the preferences GET response, but the backend nests this data inside `roommateRequests`.
- Where: `frontend/app/preferences/page.tsx` (Line 41).
- Why: The UI will silently fail to display the user's sent roommate requests because `data.sent` is always undefined.
- Suggestion: Change `setPreferences(data.sent || []);` to `setPreferences(data.roommateRequests?.sent || []);`.

## Verified Claims
- "Next.js structure implemented" → verified via `package.json` inspection → pass.
- "Port conflict bypassed" → verified via port `3001` in backend `index.ts` → pass.
- "Bcrypt and JWT implemented" → verified via `backend/src/index.ts` → pass (though not properly enforced on endpoints).
- "Hebrew RTL Support" → verified via `frontend/app/layout.tsx` (`lang="he" dir="rtl"`) → pass.

## Coverage Gaps
- None. Static code review confirms the logical bugs and missing integrations.
