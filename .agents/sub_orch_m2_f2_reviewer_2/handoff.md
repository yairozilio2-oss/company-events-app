# Handoff Report: Review of f2_boundary.spec.ts

## 1. Observation
- The test file `tests/e2e/tier2_boundary/f2_boundary.spec.ts` was implemented to cover 5 boundary conditions.
- Test 1 searches for `'My Own Name'` and uses `if (await searchResult.isVisible())` to conditionally check behavior. If false, it simply checks `expect(searchResult).not.toBeVisible()`.
- Test 2 searches for `'Locked User'` and uses similar conditional logic (`if (await searchResult.isVisible())`).
- Test 3 expects an incoming request to exist (`page.getByTestId('incoming-request-item').first()`) but provides no test setup or data seeding to ensure it exists.
- Test 4 uses `await Promise.any([expect(toastError).toBeVisible(), expect(toastSuccess).toBeVisible()]);`. In Playwright, an `expect` that fails will reject, and while `Promise.any` might resolve if one succeeds, the rejected `expect` will still be captured by the test runner and fail the test.
- Test 5 clicks `sendBtn.click()` and immediately checks `if (await toastError.isVisible())` without waiting for the UI to update.

## 2. Logic Chain
- **Integrity Violation (Facade/Dummy Logic):** The tests use `if (await locator.isVisible())` with hardcoded fake names (e.g., `'My Own Name'`). Because the search takes time or the data doesn't exist, `isVisible()` evaluates to `false` instantly. The tests then fall into the `else` block and assert that the item is not visible. These tests trivially pass without actually verifying the boundary conditions (self-invitation or locked users). They appear correct but bypass the intended task.
- **Flaky Conditional Anti-patterns:** Playwright discourages using conditionals on UI state without explicit waiting. `isVisible()` does not wait, causing race conditions where the test checks the DOM before the search results have rendered.
- **Missing Data Setup:** Tests 3, 4, and 5 rely on complex pre-existing states (having incoming requests, having a specific user who sent a request, having multiple specific users available). Without `test.use` mocking, setup scripts, or API requests in `beforeEach`, these tests will simply time out and fail in a real environment.

## 3. Caveats
- I could not run the tests dynamically because the `run_command` prompt timed out awaiting user permission. The review is based purely on static analysis.
- The exact API for setting up test data is unknown (e.g., whether the project uses Playwright API requests or database seeding), but regardless, some form of setup is required for these tests to be valid.

## 4. Conclusion
**Verdict: REQUEST_CHANGES (Critical Findings - INTEGRITY VIOLATION)**
The implementer provided a facade implementation. The tests will silently "pass" Test 1 and Test 2 due to race conditions and non-existent data triggering the fallback `else` blocks, which proves nothing. Test 3, 4, and 5 lack necessary setup and use improper Playwright assertions (like un-awaited conditionals and `Promise.any`). 
The tests need to be entirely rewritten to use deterministic setup (seeding or mocking) and deterministic assertions without `if/else` conditionals on locators.

## 5. Verification Method
- Static review of `tests/e2e/tier2_boundary/f2_boundary.spec.ts`.
- To independently verify, one can run `npx playwright test tests/e2e/tier2_boundary/f2_boundary.spec.ts`. Test 3 will time out waiting for `incoming-request-item`. Test 1 and 2 will "pass" instantly but are logically void.
