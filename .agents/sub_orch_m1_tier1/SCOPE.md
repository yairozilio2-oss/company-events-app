# Scope: M1 - Tier 1 Tests

## Architecture
- Playwright-based TypeScript E2E test suite in `tests/e2e/tier1_feature/`.
- 5 tests per feature.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | F1 Tests | 5 tests for Employee Registration & Preferences | none | DONE |
| 2 | F2 Tests | 5 tests for Roommate Selection & Approval | none | DONE |
| 3 | F3 Tests | 5 tests for Admin & Manager Capabilities | none | BLOCKED: Quota Exhausted |
| 4 | F4 Tests | 5 tests for Notifications | none | BLOCKED: Quota Exhausted |

## Interface Contracts
### Test ↔ Application
- Tests assume app is running on localhost.
- Tests must use data-testid or accessible ARIA roles.
- Follow `TEST_INFRA.md`.
