# Boundary & Corner Case Tests for F1 (Employee Registration & Preferences)

## Observation
F1 Requirements (from `ORIGINAL_REQUEST.md`): Employee Portal registration, viewing assigned events, setting preferences (arrival, kosher food, roommate request).
Scope & constraints (from `SCOPE.md` and `TEST_INFRA.md`): Playwright and TypeScript, opaque-box, tier 2 boundary tests, must use `data-testid` or accessible ARIA roles. Focus on edge cases (XSS, unexpected navigation, extreme limits). Target directory is `tests/e2e/tier2_boundary/`.

## Logic Chain
To thoroughly test the boundaries and corner cases for F1, we define 5 tests:
1. **XSS Injection**: Tests whether script tags entered into a text preference field (like dietary restrictions or roommate search) are sanitized.
2. **Extreme Input Length**: Tests the system's ability to handle an extremely long string for preferences/roommate requests.
3. **Late Submission / Deadline Boundary**: Tests behavior when user submits preferences exactly at or past the deadline (system should handle it gracefully, likely rejecting or disabling the form).
4. **Unexpected Navigation**: Tests state persistence when a user partially fills the registration, navigates away, and then returns.
5. **Bypass Required Fields**: Tests form validation when mandatory options (like arrival time or kosher food) are omitted.

## Caveats
- No implementation details exist yet, so the selectors (`data-testid`) are proposed contracts.
- Deadline testing requires a way to mock time or the event deadline in the backend. I have assumed a mockable endpoint or state.

## Conclusion
Here is the proposed Playwright TypeScript code for `tests/e2e/tier2_boundary/f1_preferences.spec.ts`.

```typescript
import { test, expect } from '@playwright/test';

test.describe('F1: Employee Registration & Preferences - Boundary & Corner Cases', () => {

  test('Test 1: XSS attempt in text preference field', async ({ page }) => {
    await page.goto('/employee/register');
    const xssPayload = "<script>alert('XSS')</script>";
    
    // Fill preferences with XSS payload
    await page.getByTestId('input-special-requests').fill(xssPayload);
    await page.getByTestId('btn-submit-preferences').click();

    // Verify script does not execute and is rendered as plain text or sanitized
    await expect(page.getByTestId('summary-special-requests')).toContainText(xssPayload);
    // Alternatively, verify that no alert dialogue is triggered
  });

  test('Test 2: Extreme input length in preference fields', async ({ page }) => {
    await page.goto('/employee/register');
    const longText = 'A'.repeat(10000);
    
    await page.getByTestId('input-special-requests').fill(longText);
    await page.getByTestId('btn-submit-preferences').click();

    // The system should either truncate, show a validation error, or accept it without crashing.
    // Assuming a max length validation:
    await expect(page.getByTestId('error-special-requests')).toBeVisible();
  });

  test('Test 3: Form submission exactly at deadline (or past)', async ({ page }) => {
    // Assume we can mock the server time or event deadline
    // Here we simulate loading the page just past the deadline
    await page.goto('/employee/register?mockTime=pastDeadline');
    
    // Form should be disabled or submit button hidden
    const submitBtn = page.getByTestId('btn-submit-preferences');
    await expect(submitBtn).toBeDisabled();
    await expect(page.getByText('Registration is closed')).toBeVisible();
  });

  test('Test 4: Unexpected navigation and state persistence', async ({ page }) => {
    await page.goto('/employee/register');
    
    // Partially fill the form
    await page.getByTestId('checkbox-kosher').check();
    await page.getByTestId('select-arrival-time').selectOption('10:00 AM');
    
    // Navigate away
    await page.goto('/employee/dashboard');
    // Navigate back
    await page.goto('/employee/register');
    
    // State should be preserved or properly reset without errors
    // Assuming state is preserved during the session:
    await expect(page.getByTestId('checkbox-kosher')).toBeChecked();
    await expect(page.getByTestId('select-arrival-time')).toHaveValue('10:00 AM');
  });

  test('Test 5: Bypassing required fields', async ({ page }) => {
    await page.goto('/employee/register');
    
    // Attempt to submit without filling mandatory fields (e.g., arrival time is required)
    await page.getByTestId('btn-submit-preferences').click();
    
    // Validation message should appear and form not submitted
    await expect(page.getByTestId('error-arrival-time')).toBeVisible();
    await expect(page.url()).toContain('/employee/register');
  });

});
```

## Verification Method
- Review the provided `tests/e2e/tier2_boundary/f1_preferences.spec.ts` proposed code against the requirements in `ORIGINAL_REQUEST.md`.
- Ensure there are exactly 5 tests focusing on boundaries/edge cases.
- Confirm usage of `data-testid` attributes.
