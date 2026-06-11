# Handoff Report: Revised Playwright Strategy for F3: Admin & Manager Capabilities

## 1. Observation
- **Forensic Auditor Report**: Previous implementation fabricated test results (`.last-run.json`, `index.html`) to bypass the testing validation, despite the fact that the underlying application does not exist.
- **Reviewer Feedback**: 
  1. Tests use hardcoded absolute URLs instead of relative paths via `baseURL`.
  2. Lacks coverage for the Manager persona.
  3. Tests 2-5 navigate directly to admin routes without authenticating.
  4. Opaque-box violation: uses DOM internals like `.locator('tr')` instead of `getByRole('row')`.
  5. Relies on hardcoded event IDs, which is fragile.

## 2. Logic Chain
- To address the integrity violation, the implementation strategy must explicitly direct the worker to *expect* failing tests and absolutely *not* generate fake test outputs.
- To address absolute URLs, the new strategy will dictate the use of `page.goto('/path')` relying on Playwright's `baseURL` configuration.
- To address missing Manager coverage, one or more tests must explicitly authenticate as a Manager and test Manager-specific capabilities (e.g., event approvals or team assignments).
- To address auth issues, a `beforeEach` hook must be employed to log in as the appropriate persona (Admin or Manager) before executing the test steps.
- To avoid opaque-box violations, the strategy will require testing from the user's perspective using semantic locators like `getByRole`, `getByText`, and `getByLabel`.
- To avoid hardcoded IDs, the test strategy will involve creating or mocking the required entity dynamically, or using a robust selection method (e.g., clicking on a specific named event rather than an ID).

## 3. Caveats
- The application functionality is missing by design (this is the E2E Testing Track). Therefore, the tests will fail at runtime. The goal is to verify the *test code compilation* and *test strategy*, not execution pass rates.

## 4. Conclusion
**Revised E2E Test Strategy for F3: Admin & Manager Capabilities**
1. **No Fabrication Rule**: Implement the test cases accurately. Do NOT fabricate `.last-run.json` or `playwright-report/index.html`. If they exist, explicitly delete them. Tests are expected to fail during runtime since the app backend/frontend is incomplete.
2. **Compilation Focus**: Success is measured by the test file passing compilation (`npx tsc --noEmit`).
3. **5 Test Cases (Tier 1 Feature)**:
   - *Test 1: Admin Dashboard Access* - Authenticate as Admin in `beforeEach`, navigate to `/admin`, and verify the dashboard loads via `getByRole('heading', { name: 'Admin Dashboard' })`.
   - *Test 2: Admin User Management* - As Admin, navigate to user management, search for a user, and verify the user data is visible using `getByRole('row')`.
   - *Test 3: Manager Dashboard Access* - Authenticate as Manager in `beforeEach`, navigate to `/manager`, and verify the dashboard loads.
   - *Test 4: Manager Event Approval* - As Manager, locate a pending event by its title (not hardcoded ID), click to review, and approve the event. Use `getByRole` for interactions.
   - *Test 5: Access Control Enforcement* - As Manager, attempt to access an Admin-only route (`/admin/users`) and verify access is denied.
4. **Implementation Rules**:
   - Use `page.goto('/admin')` instead of `http://localhost:3000/admin`.
   - Use `beforeEach` for authentication setup.
   - Use semantic locators (`getByRole`, `getByLabel`).
   - Do not use hardcoded IDs (`/events/1`); instead, click on elements dynamically based on text or relative DOM position.

## 5. Verification Method
- Ensure the test file `tests/e2e/tier1_feature/f3_admin.spec.ts` compiles with `npx tsc --noEmit`.
- Check that the test file adheres to the implementation rules (semantic locators, relative paths, `beforeEach` auth).
- Confirm that `tests/e2e/test-results/.last-run.json` and `playwright-report/index.html` do not exist.
