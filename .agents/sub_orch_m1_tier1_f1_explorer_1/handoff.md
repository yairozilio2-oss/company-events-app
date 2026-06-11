# Handoff Report: F1 Employee Registration & Preferences Tests

## Observation
- **Scope & Architecture**: Checked `SCOPE.md` and `TEST_INFRA.md`. The project requires 5 Tier 1 (Feature) tests per feature, implemented in Playwright with TypeScript. Tests must use `data-testid` or accessible ARIA roles and assume the app runs on localhost.
- **Requirement R1**: `ORIGINAL_REQUEST.md` states: "A responsive RTL web interface (Hebrew) where employees can log in, view their assigned events, set preferences (arrival, kosher food, roommate request), and see their room status."
- **Target File**: `tests/e2e/tier1_feature/f1_registration.spec.ts`

## Logic Chain
Based on R1, the 'Employee Registration & Preferences' feature can be divided into 5 core test cases (Tier 1):
1. **Login and Dashboard View**: Verifies that an employee can log in successfully and view their assigned events in an RTL Hebrew interface.
2. **End-to-End Registration Flow**: Verifies that an employee can navigate the registration flow, set arrival preferences, dietary preferences (kosher), and roommate request, and save without errors.
3. **Updating Existing Preferences**: Verifies that an employee can return to a registered event and update their preferences (e.g., change arrival time or dietary needs).
4. **Room Status Visibility**: Verifies that an employee can view their current room status (e.g., Unassigned, Pending, Locked) for an event.
5. **Form Validation and Mandatory Fields**: Verifies that submitting the registration form without required fields (if any) yields proper validation errors in Hebrew.

## Caveats
- Exact data-testids, locators, and Hebrew copy (e.g., text for "Kosher", "Save") are assumed and will need to be adjusted once the UI is implemented.
- The tests assume predefined mock user accounts and an active event exist in the local database.

## Conclusion
The 5 Tier 1 Playwright E2E tests for F1 should be structured in `f1_registration.spec.ts`.

### Proposed File Structure / Skeleton
```typescript
// c:/Users/yairo/OneDrive/Desktop/new-project/tests/e2e/tier1_feature/f1_registration.spec.ts
import { test, expect } from '@playwright/test';

test.describe('F1: Employee Registration & Preferences', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login and authenticate as a standard employee
    await page.goto('/');
    await page.getByTestId('login-email').fill('employee@example.com');
    await page.getByTestId('login-password').fill('password123');
    await page.getByTestId('login-submit').click();
  });

  test('Test 1: Login and view assigned events in RTL layout', async ({ page }) => {
    // Verify dashboard loads
    await expect(page.getByTestId('dashboard-header')).toBeVisible();
    // Verify RTL direction (html dir="rtl")
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    // Verify assigned event is visible
    await expect(page.getByTestId('event-card')).toHaveCount(1);
  });

  test('Test 2: Complete registration flow without errors', async ({ page }) => {
    await page.getByTestId('event-register-btn').click();
    
    // Set preferences
    await page.getByTestId('pref-arrival').selectOption('Bus');
    await page.getByTestId('pref-food-kosher').check();
    await page.getByTestId('pref-roommate-input').fill('john.doe@example.com');
    
    // Submit
    await page.getByTestId('submit-registration').click();
    await expect(page.getByTestId('success-message')).toBeVisible();
  });

  test('Test 3: Update existing preferences', async ({ page }) => {
    await page.getByTestId('event-edit-btn').click();
    
    // Change preferences
    await page.getByTestId('pref-arrival').selectOption('Car');
    await page.getByTestId('submit-registration').click();
    
    await expect(page.getByTestId('success-message')).toBeVisible();
  });

  test('Test 4: View current room status', async ({ page }) => {
    // Verify room status displays on the dashboard or event page
    await expect(page.getByTestId('room-status-badge')).toBeVisible();
    await expect(page.getByTestId('room-status-badge')).toContainText(/pending/i); // Actual Hebrew text to be verified
  });

  test('Test 5: Form validation for mandatory fields', async ({ page }) => {
    await page.getByTestId('event-register-btn').click();
    
    // Attempt submit without filling required fields (if applicable)
    // Example: clear an input and submit
    await page.getByTestId('submit-registration').click();
    
    // Verify error message
    await expect(page.getByTestId('error-message')).toBeVisible();
  });
});
```

## Verification Method
1. Ensure `tests/e2e/tier1_feature/f1_registration.spec.ts` aligns with the above structure.
2. Run `npx playwright test tests/e2e/tier1_feature/f1_registration.spec.ts` once the UI is implemented to ensure they pass against the correct locators.
