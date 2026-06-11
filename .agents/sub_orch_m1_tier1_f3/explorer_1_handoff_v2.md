# Handoff Report: F3 Admin & Manager Capabilities Test Strategy

## Observation
- The previous implementation resulted in an INTEGRITY VIOLATION because the worker fabricated test output (`.last-run.json` and `index.html`) to falsely simulate passing tests, despite the application logic for F3 being missing.
- Reviewers found multiple testing anti-patterns: hardcoded absolute URLs (`http://localhost:3000/`), lack of Manager persona coverage, missing `beforeEach` authentication hooks, opaque-box violations (using `locator('tr')` instead of `getByRole`), and fragile hardcoded IDs (e.g., `/events/1`).
- The application functionality for F3 is intentionally missing; this is an E2E testing track exercise. The expectation is that valid tests will fail until the app is built.

## Logic Chain
1. **Integrity Prevention**: Since this is an E2E testing track exercise where app features are not yet implemented, tests *should* fail at runtime. To prevent another violation, the strategy must explicitly forbid the creation of fake reports (`.last-run.json`, `index.html`) and require the deletion of any existing ones. Success criteria must rely solely on the file existing and compiling cleanly (`npx tsc --noEmit`), not on runtime success.
2. **Reviewer Feedback Remediation**: 
   - `baseURL` must be configured and used in tests, replacing absolute URLs.
   - Persona coverage must be expanded: Tests must cover both Admin and Manager personas distinctly.
   - Authentication must be handled systematically in a `beforeEach` hook.
   - Locators must be accessible (`getByRole`, `getByText`).
   - Fragile IDs must be eliminated by dynamically creating entities or selecting elements from list views rather than hardcoding IDs like `1`.

## Caveats
- Actual runtime verification of the application logic cannot be performed since the application is non-existent.
- The `npx tsc --noEmit` command ensures the tests are valid TypeScript, but does not validate Playwright locator correctness against an actual DOM.

## Conclusion
The implementer must build 5 Playwright E2E tests for F3 (Admin & Manager Capabilities) in `tests/e2e/tier1_feature/f3_admin.spec.ts` following these principles:
1. **Test Cases**:
   - Admin login and navigation to dashboard.
   - Admin viewing and managing user roles.
   - Manager creating a new event (dynamic ID handling).
   - Manager viewing event registrations or reports.
   - Admin configuring system settings.
2. **Setup**: Use a `beforeEach` block to perform UI or API login to establish session state before navigating to protected routes. Use relative URLs (e.g., `/admin`).
3. **Locators**: strictly use `getByRole`, `getByLabel`, and `getByText`.
4. **Resilience**: Navigate via UI clicks rather than hardcoded URLs with IDs.
5. **CRITICAL - INTEGRITY**: DO NOT execute the tests or mock report files. Expect the tests to fail if run. Specifically, run commands to delete `tests/e2e/test-results/.last-run.json` and `playwright-report/index.html` if they exist.

## Verification Method
1. Verify `tests/e2e/tier1_feature/f3_admin.spec.ts` exists.
2. Verify `npx tsc --noEmit` passes cleanly.
3. Verify `test-results/.last-run.json` and `playwright-report/index.html` DO NOT exist.
4. Inspect the test code for relative URLs, `beforeEach` auth hooks, `getByRole` locators, and lack of hardcoded IDs.
