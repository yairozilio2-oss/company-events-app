# Handoff: E2E Test Suite Framework Initialization

## Observation
- The project currently contains a `backend/` directory, `PROJECT.md`, and `TEST_INFRA.md` at the root.
- No `package.json` exists at the root, nor does the `tests/` directory exist yet.
- `PROJECT.md` specifies `tests/` as the directory for E2E and unit tests.
- `TEST_INFRA.md` dictates standardizing on Playwright with TypeScript and specifies the directory layout as `tests/e2e/tier1_feature/`, `tests/e2e/tier2_boundary/`, etc.
- Interface contracts specify testing against localhost, using `data-testid` or ARIA roles for selectors, and inspecting mock files or logs for notifications.

## Logic Chain
1. Because there is no root monorepo setup yet (no root `package.json`), and the tests are distinct from `frontend` and `backend`, creating the test framework inside the `tests/e2e/` directory as a standalone project is a clean approach.
2. The `tests/e2e/` folder must be created.
3. A `package.json` inside `tests/e2e/` needs to be initialized with `@playwright/test`, `typescript`, and `@types/node` as devDependencies.
4. `playwright.config.ts` must be created, configured for localhost testing. The exact port is not finalized, so it should rely on an environment variable.
5. Page Objects and Helper functions must be created. Based on `SCOPE.md` and `PROJECT.md` (features like Employee Registration, Roommate Selection, Notifications), we need:
  - Login helper (for testing authentication flows)
  - Notification mock reader (to verify emails/logs)
  - Page object skeleton for Employee Portal and Admin Dashboard.

## Caveats
- Since the frontend and backend are not yet fully implemented (Milestones M1-M4 are planned), the selectors and endpoints in the page objects will be placeholders based on the contract (`data-testid`).
- The exact port for the local app is unknown, so `playwright.config.ts` should rely on an environment variable (e.g., `process.env.BASE_URL || 'http://localhost:3000'`).

## Conclusion
The implementer should execute the following strategy:
1. Create directory structure: `tests/e2e/`, `tests/e2e/pages/`, `tests/e2e/helpers/`, and the tier directories defined in `TEST_INFRA.md`.
2. Initialize `package.json` in `tests/e2e/` via `npm init -y` and install Playwright and TypeScript dependencies.
3. Create `playwright.config.ts` in `tests/e2e/` with a default `baseURL` and configuration pointing to the test directories.
4. Create a login helper in `tests/e2e/helpers/loginHelper.ts`.
5. Create a Notification mock reader in `tests/e2e/helpers/notificationHelper.ts` that provides a skeleton for reading mock logs.
6. Create base Page Objects (e.g., `tests/e2e/pages/EmployeePortalPage.ts`, `tests/e2e/pages/AdminPage.ts`).

## Verification Method
- Inspect the file tree to ensure `tests/e2e/package.json` and `playwright.config.ts` exist.
- Inspect the helper and page object TS files for valid syntax.
- Run `cd tests/e2e && npx playwright test` (or `npx tsc --noEmit`) to verify that the TypeScript files compile correctly and Playwright parses the configuration without errors.
