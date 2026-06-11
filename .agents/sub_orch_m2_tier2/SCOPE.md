# Scope: M2 - Tier 2 Tests

## Architecture
- Playwright-based TypeScript E2E test suite.
- Organized by Test Tiers (Tier 2).

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | F1 Boundary | Employee Registration & Preferences Boundary Tests | none | DONE |
| 2 | F2 Boundary | Roommate Selection & Approval Boundary Tests | none | DONE |
| 3 | F3 Boundary | Admin & Manager Capabilities Boundary Tests | none | DONE |
| 4 | F4 Boundary | Notifications Boundary Tests | none | DONE |

## Interface Contracts
- Tests assume app is running on localhost (port customizable via env).
- Tests must use data-testid or accessible ARIA roles for selection.
- Mocking: For notification features, tests can inspect mock files or logs to verify emails.
