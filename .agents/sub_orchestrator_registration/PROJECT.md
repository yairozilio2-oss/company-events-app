# Project — Registration Feature

## Architecture
- **Frontend**: React component `RegistrationForm` (src/components/RegistrationForm.jsx) handling input, validation, and API calls.
- **Backend API**: Express router `auth.routes.ts` exposing `/api/register` and `/api/verify-email`.
- **Database**: PostgreSQL tables `users` and `email_verifications` with appropriate constraints and indexes.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|--------------|--------|
| 1 | UI Implementation | Frontend UI & client validation | none | PLANNED |
| 2 | Backend API | Backend endpoints & email send logic | UI Implementation | PLANNED |
| 3 | Database Schema | DB tables & migrations | Backend API | PLANNED |
| 4 | E2E Test Suite | End‑to‑end tests covering full flow | All previous | PLANNED |
| 5 | Adversarial Hardening | Gap analysis & adversarial tests | E2E Test Suite | PLANNED |

## Interface Contracts
- **POST /api/register**
  - Request: `{ email: string, password: string, name: string }`
  - Response: `{ success: true, userId: string }` or error with message.
- **GET /api/verify-email?token=...**
  - Request: token string query param.
  - Response: `{ verified: true }` or error.

## Code Layout
- `src/components/RegistrationForm.jsx` – UI component.
- `src/routes/auth.routes.ts` – API routes.
- `db/migrations/2026xxxx_create_users.sql` – DB schema.
- `tests/e2e/registration.spec.js` – E2E test.

## Success Criteria
- All unit tests pass.
- All E2E tests (Tiers 1‑4) pass.
- Forensic Auditor reports **CLEAN**.
- Coverage ≥90% for new modules.
