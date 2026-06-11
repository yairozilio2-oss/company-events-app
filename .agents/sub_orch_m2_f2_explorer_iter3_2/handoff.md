# F2 Boundary & Corner Case Tests Redesign Report

## 1. Observation
- The auditor's report highlighted an **INTEGRITY VIOLATION** in `tests/e2e/tier2_boundary/f2_boundary.spec.ts` due to facade testing patterns (conditional logic to ensure tests pass regardless of UI state).
- The reviewer's report noted severe Playwright anti-patterns, including immediate state checks without waiting (`if (await locator.isVisible())`), looping constructs without proper test flow, and `Promise.any` which creates non-deterministic results and unhandled rejections.

## 2. Logic Chain
- E2E tests must be deterministic. Conditional testing (`if/else`) allows tests to pass dynamically without validating that the application behaves correctly.
- Strict assertions (`await expect(locator).toBeVisible()`) auto-wait and ensure the application meets exact requirements. If the product code is not ready, the tests *should* fail. 
- Therefore, each boundary condition must be rewritten to strictly enforce a single expected behavior flow, omitting all conditional checks and `Promise.any` constructs.

## 3. Caveats
- The strict behaviors defined below enforce specific UX decisions (e.g., "Self-Invitation results in 0 search results" vs "User appears but button is disabled"). If the product team alters the exact UX paradigm, the strict test assertions must be updated. The tests must not be made "flexible" to accommodate unknown UX behavior.

## 4. Conclusion
The 5 F2 Boundary & Corner Case tests are redesigned to use strictly deterministic, auto-waiting assertions. 

**Redesigned Test Steps:**

### Test 1: Prevent Self-Invitation
- **Action**: Logged-in user searches for their own name.
- **Strict Assertion**: The user must not appear in the search results.
- **Playwright Steps**:
  ```javascript
  await page.getByTestId('roommate-search-input').fill('My Own Name');
  await page.getByTestId('search-submit-btn').click();
  // Auto-waiting assertions enforcing 0 results
  await expect(page.getByTestId('search-result-item')).toHaveCount(0);
  await expect(page.getByTestId('no-results-message')).toBeVisible();
  ```

### Test 2: Prevent Inviting an Already Locked User
- **Action**: User searches for an employee who is already in a "Locked" room.
- **Strict Assertion**: The user appears in the results, but the "Send Request" button is strictly disabled.
- **Playwright Steps**:
  ```javascript
  await page.getByTestId('roommate-search-input').fill('Locked User');
  await page.getByTestId('search-submit-btn').click();
  const searchResult = page.getByTestId('search-result-item').filter({ hasText: 'Locked User' });
  await expect(searchResult).toBeVisible();
  // Strictly expect the button to be disabled
  await expect(searchResult.getByTestId('send-request-btn')).toBeDisabled();
  ```

### Test 3: Auto-Cancellation of Pending Requests Upon Locking
- **Action**: User accepts an incoming request, causing their room to become "Locked".
- **Strict Assertion**: Any previously sent outgoing requests must automatically transition to a non-pending state (e.g., "Cancelled").
- **Playwright Steps**:
  ```javascript
  // Accept request
  await incomingRequest.getByTestId('accept-request-btn').click();
  await expect(page.getByTestId('room-status-label')).toHaveText('Locked');
  // Navigate to outgoing requests and assert absence of 'Pending' requests
  await page.goto('/roommates/outgoing');
  await expect(page.getByTestId('outgoing-request-item').filter({ hasText: 'Pending' })).toHaveCount(0);
  await expect(page.getByTestId('outgoing-request-item').filter({ hasText: 'Cancelled' })).toHaveCount(1);
  ```

### Test 4: Graceful Handling of Mutual Invitations
- **Action**: User searches for User A (who already sent an invitation to them) and clicks "Send Request".
- **Strict Assertion**: The application must auto-accept the request and form the room successfully, displaying a specific success toast (no `Promise.any`).
- **Playwright Steps**:
  ```javascript
  await searchResult.getByTestId('send-request-btn').click();
  // Strict expectation of success message
  await expect(page.getByTestId('toast-success')).toHaveText('Room formed successfully');
  await expect(page.getByTestId('room-status-label')).toHaveText('Locked');
  ```

### Test 5: Prevent Sending Requests Exceeding Room Capacity
- **Action**: User attempts to send an outgoing request when they are already at the maximum allowed pending requests limit.
- **Strict Assertion**: The request is blocked, and a specific error toast is shown.
- **Playwright Steps**:
  ```javascript
  await searchResult.getByTestId('send-request-btn').click();
  // Strict expectation of error toast
  await expect(page.getByTestId('toast-error')).toHaveText('Maximum outgoing requests reached');
  // Ensure the request wasn't actually sent by verifying the button didn't change to "Pending"
  await expect(searchResult.getByTestId('send-request-btn')).toBeVisible();
  ```

## 5. Verification Method
- Code Review: Ensure the newly implemented `tests/e2e/tier2_boundary/f2_boundary.spec.ts` contains zero `if` statements, zero uses of `.count()` outside of `expect().toHaveCount()`, and zero uses of `Promise.any`.
- Execution: Run `npx playwright test tests/e2e/tier2_boundary/f2_boundary.spec.ts`. Verify that the tests fail accurately if the application does not adhere to these exact requirements.
