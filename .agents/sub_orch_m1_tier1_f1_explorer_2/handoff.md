# Handoff Report: F1 Test Design (Employee Registration & Preferences)

## 1. Observation
- `ORIGINAL_REQUEST.md` states requirement **R1**: "A responsive RTL web interface (Hebrew) where employees can log in, view their assigned events, set preferences (arrival, kosher food, roommate request), and see their room status."
- `ORIGINAL_REQUEST.md` Acceptance Criteria specifies: "Employee can navigate the registration flow and select preferences without errors."
- `SCOPE.md` details M1: "5 tests for Employee Registration & Preferences" in Playwright TypeScript E2E format.
- `TEST_INFRA.md` specifies an opaque-box, requirement-driven methodology utilizing `tests/e2e/tier1_feature/` and prioritizing `data-testid` or ARIA roles for selection.
- Target file for tests: `tests/e2e/tier1_feature/f1_registration.spec.ts`

## 2. Logic Chain
- To thoroughly cover **R1**, we must split its components (Login/View Events, Complete Registration Flow, Update Preferences, View Status, UI Layout) into 5 distinct Playwright E2E tests:
  1. **Login & View Events:** The foundational step; employee must access the portal and see assigned events.
  2. **Complete Registration Flow:** The core functional requirement. The employee must be able to select preferences (arrival, kosher food, etc.) and submit successfully.
  3. **Update Preferences:** Users often change their minds. Verifying that a previously saved preference can be updated and re-saved is crucial for a complete feature.
  4. **View Room Status:** The employee must be able to visually check their room status (e.g., Unassigned or Pending).
  5. **RTL & Localization:** R1 explicitly mandates a "responsive RTL web interface (Hebrew)". We must test that the HTML has `dir="rtl"` and expected Hebrew elements are rendered.
- All tests will reside in the target file using standard Playwright `.spec.ts` structure and generic `data-testid` locators so that the UI can be built around them.

## 3. Caveats
- No source code or application UI exists yet. The test design relies purely on `data-testid` attributes and mocked assumptions (e.g., login route is `/login`, dashboard is `/dashboard`).
- The tests assume an authentication mechanism can be bypassed or automated (e.g., via a standard form login).
- Tests will need to interact with a mock backend or seed data to ensure events actually exist for the employee.

## 4. Conclusion
The implementation of the tests should be placed in `c:/Users/yairo/OneDrive/Desktop/new-project/tests/e2e/tier1_feature/f1_registration.spec.ts` with the following structure:

```typescript
import { test, expect } from '@playwright/test';

test.describe('F1: Employee Registration & Preferences', () => {
  
  test.beforeEach(async ({ page }) => {
    // Setup: Navigate to app and authenticate as a standard employee
    await page.goto('/login');
    await page.getByTestId('login-email').fill('employee@example.com');
    await page.getByTestId('login-password').fill('password');
    await page.getByTestId('login-submit').click();
  });

  test('should allow employee to log in and view assigned events', async ({ page }) => {
    // Navigate to dashboard
    await expect(page.getByTestId('event-list')).toBeVisible();
    await expect(page.getByTestId('event-item')).toHaveCountGreaterThan(0);
  });

  test('should allow employee to complete the registration flow with all preferences', async ({ page }) => {
    // Select an event
    await page.getByTestId('event-item').first().click();
    
    // Fill preferences
    await page.getByTestId('pref-arrival').selectOption('morning');
    await page.getByTestId('pref-kosher').check();
    await page.getByTestId('pref-roommate').fill('colleague@example.com');
    await page.getByTestId('submit-registration').click();

    // Verify success
    await expect(page.getByTestId('success-message')).toBeVisible();
  });

  test('should allow employee to update their previously saved preferences', async ({ page }) => {
    // Select event and edit
    await page.getByTestId('event-item').first().click();
    await page.getByTestId('edit-preferences').click();
    
    // Change option
    await page.getByTestId('pref-arrival').selectOption('evening');
    await page.getByTestId('submit-registration').click();

    // Verify updated success
    await expect(page.getByTestId('success-message')).toContainText('updated');
  });

  test('should allow employee to view their current room allocation status', async ({ page }) => {
    await page.getByTestId('event-item').first().click();
    await page.getByTestId('view-room-status').click();
    
    // Validate status text
    const statusText = page.getByTestId('room-status');
    await expect(statusText).toBeVisible();
    // Assuming 'Unassigned' or similar default state
  });

  test('should render the interface in RTL mode with appropriate Hebrew labels', async ({ page }) => {
    // Check RTL
    const htmlDir = await page.locator('html').getAttribute('dir');
    expect(htmlDir).toBe('rtl');
    
    // Verify some Hebrew text is present in main structural components
    await expect(page.getByRole('heading', { name: /העדפות/i })).toBeVisible(); // 'Preferences' in Hebrew
  });
});
```

## 5. Verification Method
- **File to inspect:** `tests/e2e/tier1_feature/f1_registration.spec.ts`
- **Command:** `npx playwright test tests/e2e/tier1_feature/f1_registration.spec.ts`
- **Invalidation condition:** If the final frontend code decides not to use `data-testid` or implements a completely different flow (like a multi-step wizard rather than a single form), these tests will need their selectors adjusted.
