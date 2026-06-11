# Project: Employee Registration & Room Allocation
# Scope: Global

## Architecture
- A Node.js or Python backend with a relational database (SQLite/PostgreSQL) for user data, events, and room allocations.
- A modern frontend framework (React/Next.js) for the employee portal and admin dashboard.
- REST or GraphQL API for client-server communication.
- Automated tests and mock notification logs.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1: Backend setup & Data models | Users, events, rooms, preferences schema | none | DONE |
| 2 | M2: Employee Portal | UI for login, preferences, Hebrew RTL support | M1 | IN_PROGRESS |
| 3 | M3: Roommate Selection | Logic for bidirectional approval, locking, gender check | M1, M2 | PLANNED |
| 4 | M4: Admin & Auto-Allocation | Admin UI, auto-assign algorithm | M3 | PLANNED |
| 5 | M5: E2E Tests | Final E2E pass and test completion | M1, M2, M3, M4 | PLANNED |

## Interface Contracts
### API ↔ Frontend
- `/api/auth` - Login, logout
- `/api/events` - List events
- `/api/preferences` - Set/get preferences
- `/api/roommates` - Send request, accept request, room status
- `/api/allocate` - Trigger auto-allocation

## Code Layout
- `backend/` - Server code and database
- `frontend/` - React frontend code
- `tests/` - E2E and unit tests
