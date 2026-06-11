## 1. Observation
- The Forensic Auditor found that `sanity.spec.ts` uses `expect(true).toBe(true)` (hardcoded result) and that `loginHelper.ts` and `notificationHelper.ts` use empty functions or return empty arrays (facades).
- The Challengers found that `TEST_INFRA.md` requires specific directories (`tier1_feature`, `tier2_boundary`, `tier3_cross`, `tier4_realworld`) which are missing. Tests exist in the root `e2e` directory.
- The Challengers found `tests/e2e/test_runner.sh` is missing.
- `playwright.config.ts` only configures `chromium`, lacks a `webServer` block, and lacks explicit global timeouts.
- File inspection confirmed `tests/e2e/helpers/loginHelper.ts` and `tests/e2e/helpers/notificationHelper.ts` are stubs without real implementation.

## 2. Logic Chain
- Development mode strictly prohibits hardcoded tests and facade implementations. The empty functions in the helpers and the `expect(true).toBe(true)` in `sanity.spec.ts` must be removed entirely rather than bypassed to restore integrity.
- `TEST_INFRA.md` requires a specific architectural layout and configurations (tiers, `test_runner.sh`, cross-browser support). The existing setup must be restructured to match these requirements to pass the Challenger gates.
- Deleting the facade helpers and the hardcoded sanity test directly addresses the integrity violations without circumventing the audit.
- Adding the tier directories, `test_runner.sh`, and updating `playwright.config.ts` (with `webServer`, multiple browsers, and timeouts) directly addresses all structural requirements.

## 3. Caveats
- The application server may not exist yet in Milestone 0. Adding a `webServer` command like `npm run dev` might fail if not configured in the application's `package.json`. A dummy server or minimal app implementation might be needed to pass testing if Playwright expects a live server.
- Removing `sanity.spec.ts` leaves the test suite with 0 tests. If Playwright fails on empty test suites, a real minimal test against the local webServer (e.g., verifying the homepage loads with a 200 status) must be implemented instead of a hardcoded assertion.

## 4. Conclusion
The proposed fix strategy is:
1. **Fix Integrity Violations**: Delete `sanity.spec.ts` and the `helpers` directory (`loginHelper.ts`, `notificationHelper.ts`). If a single sanity test is strictly required to pass CI with >0 tests, implement a real test that boots the `webServer` and verifies the home page HTTP status, avoiding any hardcoded `expect(true).toBe(true)`.
2. **Fix Structural Issues**: 
   - Create directories: `tier1_feature`, `tier2_boundary`, `tier3_cross`, `tier4_realworld` inside `tests/e2e`.
   - Create `tests/e2e/test_runner.sh` with a script to execute the tests (e.g., `#!/bin/bash npx playwright test`).
   - Modify `playwright.config.ts` to include:
     - `webServer` configuration block.
     - Projects for `firefox` and `webkit` to ensure cross-browser coverage.
     - Explicit global `timeout: 30000` (or similar).

## 5. Verification Method
1. Run `ls tests/e2e` to confirm the presence of tier directories and `test_runner.sh`, and the absence of facade helpers.
2. Run `cat tests/e2e/playwright.config.ts` to verify the inclusion of `webServer`, cross-browser projects, and explicit timeouts.
3. Run `npx playwright test` to ensure the framework starts properly without integrity violations.
