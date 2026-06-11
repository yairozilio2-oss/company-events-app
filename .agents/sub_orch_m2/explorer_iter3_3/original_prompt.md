## 2026-06-11T00:44:35Z
Investigate the codebase and propose a strategy to fix the M2: Employee Portal implementation.
Scope: Frontend UI for login, preferences, Hebrew RTL support (`dir="rtl"`, `lang="he"`), and backend API endpoints (`/api/auth`, `/api/preferences`).

Previous failure output from Reviewers (Iteration 2):
1. **API Endpoint Mismatch**: The backend and frontend still use `/api/login` instead of the specified `/api/auth`.
2. **Frontend Data Structure Bug**: `frontend/app/preferences/page.tsx` expects `data.sent`, but the backend responds with `{ registration, roommateRequests: { sent, received } }`. The frontend should be reading `data.roommateRequests?.sent`.
3. **Leftover Files**: CRA directories (`src`, `public`) were left in the `frontend` folder.

Propose a concrete fix strategy to resolve these issues manually.
Write your handoff report to `c:\Users\yairo\OneDrive\Desktop\new-project\.agents\sub_orch_m2\explorer_iter3_3\handoff.md` and send a message.
