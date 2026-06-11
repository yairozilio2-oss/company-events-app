# Review Report: F3 Admin & Manager Capabilities Playwright Tests

## Observation
1. **File:** `tests/e2e/tier1_feature/f3_admin.spec.ts`
2. **Implementation internal usage:** In the test "Admin can view a list of registered employees and their status", the assertion relies on HTML tags instead of accessibility roles or testids:
   ```typescript
   await expect(page.getByTestId('registration-list').locator('tr').nth(0)).toBeVisible();
   ```
3. **Hardcoded IDs:** Tests 3 and 4 navigate to `http://localhost:3000/admin/events/1` and `http://localhost:3000/admin/events/1/allocation`, relying on a hardcoded ID of `1` for the event, which could cause fragility if run in parallel or without a specifically seeded database.

## Logic Chain
1. The requirement explicitly states tests must "use opaque-box Playwright testing methodology with `data-testid` and `aria-roles` and don't rely on implementation internals."
2. The use of `.locator('tr')` couples the test to the specific HTML implementation (`<table>`, `<tr>`), violating the opaque-box and interface-conformance requirements. A resilient, opaque-box approach would use `.getByRole('row')` or a `data-testid` on the list items.
3. Hardcoded URL paths like `/events/1` assume the first event exists and is always ID 1, which may lead to test failures in parallel execution or non-deterministic environments.

## Caveats
- `npx tsc --noEmit` could not be run due to terminal command permission constraints, so TypeScript compilation is unverified.

## Conclusion
**Verdict: REQUEST_CHANGES**

- **Critical Finding (Implementation Internals):** Replace `.locator('tr')` with an opaque-box locator like `.getByRole('row')` or use specific `data-testid` attributes for rows.
- **Major Finding (Hardcoded state):** Avoid hardcoding `/1` in URLs. Instead, extract the created event URL from the "create event" test, or ensure a resilient setup/teardown phase if relying on seeded IDs.

## Verification Method
Inspect the file `tests/e2e/tier1_feature/f3_admin.spec.ts` to confirm `tr` is removed and opaque-box selectors (`getByRole`, `getByTestId`) are used exclusively. Run tests to confirm robust state management.
