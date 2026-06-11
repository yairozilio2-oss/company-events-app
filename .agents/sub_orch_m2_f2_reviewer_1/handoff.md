# Handoff: F2 Boundary & Corner Case Tests Review

## Review Summary

**Verdict**: REQUEST_CHANGES

## 1. Observation
I reviewed the newly implemented test file `tests/e2e/tier2_boundary/f2_boundary.spec.ts` against the 5 boundary conditions specified in `c:/Users/yairo/OneDrive/Desktop/new-project/.agents/sub_orch_m2_f2_explorer_iter2_3/handoff.md`. 
The file contains 5 tests corresponding to the 5 boundary conditions. However, the tests make heavy use of conditional logic and immediate state checks that violate Playwright best practices.
Specific observations:
- **Test 1 & 2**: Use `if (await searchResult.isVisible())`. Since `click()` on search does not wait for network responses, `isVisible()` will likely evaluate to false immediately, bypassing the assertions and causing false positives.
- **Test 3**: Uses `const outgoingCount = await outgoingRequests.count();` right after navigating. `count()` does not auto-wait, so if the items haven't rendered yet, the count is 0, the loop skips, and the test passes falsely.
- **Test 4**: Uses `Promise.any([expect(toastError).toBeVisible(), expect(toastSuccess).toBeVisible()])`. Playwright's `expect` creates a retrying promise. The one that fails will continue to retry in the background until it throws an unhandled rejection, causing test flakiness or failure.
- **Test 5**: Uses `if (await toastError.isVisible()) break;`. Again, no wait is performed, causing race conditions where the toast might appear milliseconds after `isVisible()` evaluates to false.

## 2. Logic Chain
- For tests to be reliable and valuable, they must be deterministic. Conditional testing (if/else) violates this, as tests should assert a specific expected behavior rather than accepting multiple possible states ambiguously.
- Playwright's `isVisible()` and `count()` methods do not automatically wait for the element to meet the condition (unlike `expect(locator).toBeVisible()`). Calling them immediately after an action (like clicking search or navigating) introduces race conditions where the DOM hasn't updated yet.
- Unhandled rejections from `Promise.any` with `expect` matchers will cause test runner instability.
- Because of these issues, the current test suite will be highly flaky, non-deterministic, and prone to false positives (passing without actually testing the assertions).

## 3. Caveats
- Without running the tests against a live UI (blocked by command execution permissions), I am relying on static analysis of the Playwright API usage. However, these are well-documented Playwright anti-patterns that definitively cause flakiness.

## 4. Conclusion
The file covers the 5 boundary conditions structurally, but the implementation relies on severe Playwright anti-patterns. 

**Recommended Fixes:**
1. Remove conditional testing (`if/else`). The test must assert a single expected behavior based on the specific mocked/expected state.
2. Replace immediate state checks (`isVisible()`, `count()`) with proper auto-waiting assertions (e.g., `await expect(locator).toHaveCount(n)` or `await expect(locator).toBeVisible()`).
3. Remove `Promise.any` for assertions.
4. Ensure all network actions (like search) have corresponding assertions that wait for the result to load before proceeding.

## 5. Verification Method
- Review the modified `f2_boundary.spec.ts` to ensure no `if` statements are used to branch test logic.
- Ensure `await expect(...)` is used for all state verifications instead of boolean-returning methods like `isVisible()` or `count()`.
