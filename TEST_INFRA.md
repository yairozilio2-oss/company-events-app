# E2E Test Infra: Company Seminar Management System

## Test Philosophy
- Opaque-box, requirement-driven. No dependency on implementation design.
- Methodology: Category-Partition + BVA + Pairwise + Workload Testing.

## Feature Inventory
| # | Feature | Source (requirement) | Tier 1 | Tier 2 | Tier 3 |
|---|---------|---------------------|:------:|:------:|:------:|
| 1 | Employee Registration & Preferences | R1 | 5 | 5 | ✓ |
| 2 | Roommate Selection & Approval | R2 | 5 | 5 | ✓ |
| 3 | Admin & Manager Capabilities | R3 | 5 | 5 | ✓ |
| 4 | Notifications (Mock/Log based) | R4 | 5 | 5 | ✓ |

## Test Architecture
- Test runner: Playwright (JavaScript/TypeScript) or Python pytest with playwright. Let's standardize on Playwright with TypeScript since it's a web UI app.
- Directory layout: 
  - `tests/e2e/test_runner.sh`
  - `tests/e2e/tier1_feature/`
  - `tests/e2e/tier2_boundary/`
  - `tests/e2e/tier3_cross/`
  - `tests/e2e/tier4_realworld/`

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 1 | Full group registration with mixed roommate invites and admin auto-allocation | F1, F2, F3, F4 | High |
| 2 | Registration updates, roommate rejections, and deadline expiration | F1, F2, F3, F4 | High |
| 3 | Admin exports full occupancy report after event closure | F1, F3 | Medium |
| 4 | Gender separation edge cases with auto-allocation | F2, F3 | High |
| 5 | Waitlisted user gets an open spot after cancellation | F1, F3, F4 | Medium |

## Coverage Thresholds
- Tier 1: ≥5 per feature
- Tier 2: ≥5 per feature (where boundaries exist)
- Tier 3: pairwise coverage of major feature interactions
- Tier 4: ≥5 realistic application scenarios
