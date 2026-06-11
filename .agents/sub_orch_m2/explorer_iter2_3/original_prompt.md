## 2026-06-11T00:41:26+03:00

Investigate the codebase and propose a strategy to fix the M2: Employee Portal implementation.
Scope: Frontend UI for login, preferences, Hebrew RTL support (`dir="rtl"`, `lang="he"`), and backend API endpoints (`/api/auth`, `/api/preferences`).

Previous failure output from Reviewers:
- Critical Integrity Violations: The implementation was a facade.
- Frontend `package.json` contains a Create React App configuration (`react-scripts`) without Next.js or Tailwind, but the files created were Next.js App Router (`app/layout.tsx`, `app/login/page.tsx`).
- Port conflict: The frontend fetch calls target `localhost:3000` but the backend also defaults to 3000.
- Backend auth uses plaintext password comparison against `passwordHash` and returns a dummy token.

Propose a concrete fix strategy to resolve these issues manually (without relying on interactive terminal commands like `npm install`). 
Write your handoff report to `c:\Users\yairo\OneDrive\Desktop\new-project\.agents\sub_orch_m2\explorer_iter2_3\handoff.md` and send a message.
