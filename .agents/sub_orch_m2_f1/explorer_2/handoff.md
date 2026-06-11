# Handoff Report: F1 Boundary & Corner Case Tests

## Observation
- `ORIGINAL_REQUEST.md` details R1: "Employee Portal: A responsive RTL web interface (Hebrew) where employees can log in, view their assigned events, set preferences (arrival, kosher food, roommate request), and see their room status."
- `TEST_INFRA.md` specifies Tier 2 Boundary testing coverage for F1 (5 tests).
- `SCOPE.md` limits the scope to Playwright-based TypeScript E2E tests using `data-testid` or accessible ARIA roles.

## Logic Chain
1. F1 core interactions are viewing events and setting preferences.
2. We must identify edge conditions outside the "happy path."
3. **Corner Case 1**: Input anomalies. Free-text inputs (like notes for kosher food or roommate names) must be resistant to XSS and extreme lengths.
4. **Corner Case 2**: Race conditions. A common UI bug is double-clicking submit, leading to duplicate database records.
5. **Corner Case 3**: Temporal boundaries. Preferences submitted after the admin-defined deadline should be rejected or disabled.
6. **Corner Case 4**: Logical boundaries. A user attempting to request themselves as a roommate is an invalid state that must be handled.
7. **Corner Case 5**: Access control boundaries. Navigating directly to a registration URL for an event the employee is not assigned to.

## Caveats
- Assuming standard input fields exist based on standard web application behavior.
- Assuming there is a mechanism to seed tests with events in various states (past deadline, unassigned, etc.).
- Authentication setup is abstracted in the tests assuming a standard `login` helper or Playwright setup.

## Conclusion
Here is the proposed Playwright TypeScript test suite for the F1 Boundary & Corner Cases.

```typescript
import { test, expect } from '@playwright/test';

test.describe('F1 Boundary & Corner Cases: Employee Registration & Preferences', () => {

  test.beforeEach(async ({ page }) => {
    // Assuming standard login utility or authenticated state
    await page.goto('/login');
    await page.getByTestId('input-email').fill('employee@example.com');
    await page.getByTestId('input-password').fill('password123');
    await page.getByTestId('btn-submit-login').click();
  });

  // Test 1: Input Anomalies (Special Characters & Large Payloads)
  test('should handle extreme input lengths and special characters in preference notes', async ({ page }) => {
    await page.goto('/events/event-1/register');
    
    const longString = 'א'.repeat(5000); // 5000 Hebrew characters
    const specialChars = '<script>alert("xss")</script> 💥 &%$#';
    
    await page.getByTestId('select-arrival').selectOption('bus');
    await page.getByTestId('checkbox-kosher').check();
    await page.getByTestId('input-dietary-notes').fill(longString);
    await page.getByTestId('input-roommate-notes').fill(specialChars);
    
    await page.getByTestId('btn-submit-registration').click();
    
    // Expect validation error for the excessively long string
    await expect(page.getByTestId('error-dietary-notes')).toBeVisible();
    
    // Correct it and save
    await page.getByTestId('input-dietary-notes').fill('Valid length note');
    await page.getByTestId('btn-submit-registration').click();
    
    // Should save successfully, retaining special chars safely
    await expect(page.getByTestId('success-message')).toBeVisible();
    await expect(page.getByTestId('input-roommate-notes')).toHaveValue(specialChars);
  });

  // Test 2: Race Conditions (Duplicate Submission)
  test('should prevent duplicate submissions when clicking submit rapidly', async ({ page }) => {
    await page.goto('/events/event-1/register');
    await page.getByTestId('select-arrival').selectOption('car');
    
    const submitBtn = page.getByTestId('btn-submit-registration');
    
    // Simulate rapid double click
    await submitBtn.dblclick();
    
    // Assert button is disabled and only one success notification occurs
    await expect(submitBtn).toBeDisabled();
    await expect(page.getByTestId('success-message')).toHaveCount(1);
  });

  // Test 3: Temporal Boundaries (Post-Deadline updates)
  test('should enforce deadline restrictions on preference updates', async ({ page }) => {
    // Navigate to an event where deadline is in the past
    await page.goto('/events/event-past-deadline/register');
    
    // UI elements should be disabled and error message visible
    await expect(page.getByTestId('select-arrival')).toBeDisabled();
    await expect(page.getByTestId('input-roommate-request')).toBeDisabled();
    await expect(page.getByTestId('btn-submit-registration')).toBeDisabled();
    await expect(page.getByTestId('deadline-passed-message')).toBeVisible();
  });

  // Test 4: Logical Boundaries (Self-Invite)
  test('should prevent user from requesting themselves as a roommate', async ({ page }) => {
    await page.goto('/events/event-1/register');
    
    await page.getByTestId('input-roommate-email').fill('employee@example.com'); // Their own email
    await page.getByTestId('btn-request-roommate').click();
    
    // Expect specific validation error preventing self-invitation
    await expect(page.getByTestId('error-roommate-email')).toHaveText(/cannot invite yourself/i);
  });

  // Test 5: Access Control Boundaries (Unassigned Event)
  test('should gracefully handle accessing an unassigned or non-existent event registration', async ({ page }) => {
    // Employee tries to access registration for an event they aren't invited to
    await page.goto('/events/event-unassigned/register');
    
    // Should be redirected or shown a forbidden message, not a crash
    await expect(page.getByTestId('unauthorized-event-message')).toBeVisible();
    await expect(page.getByTestId('btn-submit-registration')).not.toBeVisible();
  });
});
```

## Verification Method
1. Verify the handoff contains exactly 5 tests focusing on boundary and corner cases.
2. Check that the provided code utilizes Playwright (`@playwright/test`) and TypeScript.
3. Confirm that assertions and interactions are done via `data-testid` or ARIA-equivalent selectors.
4. Verify tests address the F1 scope criteria (Employee Registration & Preferences).
