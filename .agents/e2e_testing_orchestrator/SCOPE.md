# Scope: E2E Test Suite Creation

## Architecture
- Playwright-based TypeScript E2E test suite.
- Organized by Test Tiers (1-4).

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 0 | Setup & Framework | Playwright config, page objects skeleton, helper functions, mocks | none | DONE |
| 1 | Tier 1 Tests | 5 feature tests per requirement (F1-F4) | M0 | IN_PROGRESS |
| 2 | Tier 2 Tests | 5 boundary tests per requirement (F1-F4) | M0 | DONE |
| 3 | Tier 3 Tests | Pairwise coverage of interactions | M1, M2 | PLANNED |
| 4 | Tier 4 Tests | 5 real-world scenarios | M3 | PLANNED |

## Interface Contracts
### Test ↔ Application
- Tests assume app is running on localhost (port customizable via env).
- Tests must use data-testid or accessible ARIA roles for selection.
- Mocking: For notification features, tests can inspect mock files or logs to verify emails, or use a mocked backend.
