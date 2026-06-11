# Scope: M2 - Employee Portal

## Architecture
- Frontend: Login UI, Preferences UI, RTL support (Hebrew)
- Backend: API endpoints for login and preferences. Prisma schema already exists, need to migrate.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Full M2 | Login UI, Preferences UI, RTL, Backend endpoints | M1 | PLANNED |

## Interface Contracts
### Frontend ↔ Backend
- POST /api/login
- GET /api/preferences
- PUT /api/preferences
