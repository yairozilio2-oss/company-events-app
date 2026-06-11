# Observation
- Requirements in `ORIGINAL_REQUEST.md` state R1: Employee Portal (registration, assigned events, arrival, kosher food, roommate request).
- `TEST_INFRA.md` specifies Tier 2 Boundary tests are needed for F1 (Employee Registration & Preferences), requesting 5 tests.
- `SCOPE.md` requires 5 boundary tests using Playwright and TypeScript with `data-testid` or ARIA roles, and tests should target `tests/e2e/tier2_boundary/`.

# Logic Chain
1. Based on R1 requirements, the registration form contains inputs for arrival times, food preferences, and roommate/notes.
2. Boundary and corner conditions for such a form include: missing required inputs, maximum character limits for text fields, rapid state changes (toggling), deadline boundary enforcement, and input value boundary (invalid values).
3. The 5 designed tests cover:
   - **Missing mandatory fields**: Boundary for empty state.
   - **Extremely long input for notes**: Boundary for maximum length constraint.
   - **Rapid state toggling**: Corner Case for UI state consistency and debouncing.
   - **Registration after deadline**: Boundary for time constraints.
   - **DOM manipulation for invalid arrival time**: Boundary for input validation bypass.
4. The test design uses Playwright to simulate these cases relying on `data-testid` locators.

# Caveats
- The application's UI structure, specific field requirements (e.g., whether notes are limited to a certain length or if arrival time is a dropdown), and exact `data-testid` names are assumed as the implementation does not exist yet.
- Assumed standard routing such as `/employee-portal/event/{id}`.

# Conclusion
The proposed boundary and corner case tests fulfill the scope requirements for F1 Tier 2 coverage, ensuring robustness against invalid data, form tampering, and edge conditions. The proposed code should be placed in `tests/e2e/tier2_boundary/f1_boundary.spec.ts`.

## Proposed Code

```typescript
import { test, expect } from '@playwright/test';

test.describe('F1: Employee Registration & Preferences - Boundary & Corner Cases', () => {
  
  test.beforeEach(async ({ page }) => {
    // Setup mock user login and navigate to employee portal event page
    // Assuming user is already authenticated
    await page.goto('/employee-portal/event/123');
  });

  // 1. Missing Mandatory Fields
  test('should display validation errors when mandatory preferences are missing', async ({ page }) => {
    // Attempt to submit without selecting required fields
    await page.getByTestId('submit-registration-btn').click();
    
    // Verify error messages appear
    await expect(page.getByTestId('error-arrival-time')).toBeVisible();
    await expect(page.getByTestId('error-food-preference')).toBeVisible();
  });

  // 2. Extremely Long Input
  test('should handle extremely long text in roommate request or notes gracefully', async ({ page }) => {
    const longText = 'A'.repeat(5000); // 5000 characters
    
    await page.getByTestId('input-arrival-time').selectOption('Morning');
    await page.getByTestId('input-food-preference').selectOption('Kosher');
    
    const notesInput = page.getByTestId('input-special-notes');
    await notesInput.fill(longText);
    
    await page.getByTestId('submit-registration-btn').click();
    
    // Check if it's truncated based on HTML maxLength or if a validation error is shown
    const maxLength = await notesInput.getAttribute('maxlength');
    if (maxLength) {
        expect(await notesInput.inputValue()).toHaveLength(Number(maxLength));
    } else {
        await expect(page.getByTestId('error-special-notes')).toBeVisible();
    }
  });

  // 3. Toggling State Rapidly
  test('should save correct final state when toggling preferences rapidly', async ({ page }) => {
    await page.getByTestId('input-arrival-time').selectOption('Morning');
    
    // Toggle kosher food multiple times rapidly
    const kosherCheckbox = page.getByTestId('checkbox-kosher');
    await kosherCheckbox.check();
    await kosherCheckbox.uncheck();
    await kosherCheckbox.check();
    
    await page.getByTestId('submit-registration-btn').click();
    
    await expect(page.getByTestId('success-message')).toBeVisible();
    
    // Reload to verify persistent state is correct
    await page.reload();
    await expect(kosherCheckbox).toBeChecked();
  });

  // 4. Registration After Deadline
  test('should prevent registration and disable form when deadline has passed', async ({ page }) => {
    // Navigate to an event where deadline is in the past
    await page.goto('/employee-portal/event/past-deadline-id');
    
    const submitBtn = page.getByTestId('submit-registration-btn');
    await expect(submitBtn).toBeDisabled();
    await expect(page.getByTestId('deadline-passed-msg')).toBeVisible();
  });

  // 5. Invalid Arrival Time / Form Tampering
  test('should reject invalid arrival time submitted via DOM manipulation', async ({ page }) => {
    await page.getByTestId('input-food-preference').selectOption('Kosher');
    
    // Inject invalid option into dropdown and select it to bypass client-side limits
    await page.evaluate(() => {
      const select = document.querySelector('[data-testid="input-arrival-time"]') as HTMLSelectElement;
      if (select) {
        const option = document.createElement('option');
        option.value = 'Invalid_Time_3AM';
        option.text = 'Invalid Time';
        select.add(option);
        select.value = 'Invalid_Time_3AM';
      }
    });
    
    await page.getByTestId('submit-registration-btn').click();
    
    // Expect server or client validation to catch the invalid enum value
    await expect(page.getByTestId('error-arrival-time')).toBeVisible();
  });

});
```

# Verification Method
1. Create `tests/e2e/tier2_boundary/f1_boundary.spec.ts` with the proposed code.
2. Run `npx playwright test tests/e2e/tier2_boundary/f1_boundary.spec.ts`.
3. The tests should fail initially (as the application code is not implemented yet). Implementation should then focus on passing these boundary scenarios.
