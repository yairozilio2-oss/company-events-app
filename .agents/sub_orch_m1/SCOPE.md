# Scope: M1: Backend setup & Data models

## Architecture
- Node.js backend using Express or Fastify.
- SQLite database.
- Prisma or Sequelize or raw sqlite3 for ORM/queries. Let's assume Prisma or raw sqlite3. Let's let the worker decide, but Prisma is good for fast models.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Init Backend | Setup Node project, Express, Prisma, test endpoint | none | DONE |
| 2 | Data Models | Users, events, rooms, preferences schema | 1 | DONE |

## Interface Contracts
- Provide a clear project structure inside `backend/` directory.
- `package.json` with scripts: `start`, `dev`, `test`.
- Setup database file in `backend/database.sqlite` (or `backend/prisma/dev.db`).
- Models:
  - User: id, name, gender, email, role (admin/employee), etc.
  - Event: id, name, date, location.
  - Room: id, capacity, eventId, gender (M/F/Mixed).
  - Preference (Roommate Request): id, requesterId, requestedId, status (pending/approved/rejected).
