# Handoff Report: F3 Admin & Manager Capabilities Test Strategy

## 1. Observation
We have been tasked with recommending a strategy to implement 5 Playwright test cases for Tier 1 Feature coverage (F3: Admin & Manager Capabilities). 
The tests must be opaque-box, requirement-driven, written in TypeScript, target `tests/e2e/tier1_feature/f3_admin.spec.ts`, and use `data-testid` or ARIA roles where possible, focusing on the happy path.
The 5 required tests are:
1. Admin can log in/access admin portal
2. Admin can create an event with a deadline
3. Admin can view a list of registered employees and their status
4. Admin can trigger auto-allocation for unassigned users
5. Admin can view/export an occupancy report

## 2. Logic Chain
- **Opaque-Box Requirement**: Since testing must be opaque-box, the tests should purely interact with the UI using Playwright locators without mocking internal states. 
- **Locator Strategy**: Best practice in Playwright involves using semantic ARIA roles (e.g., `page.getByRole('button', { name: 'Log in' })`) and explicit test IDs (`page.getByTestId('...')`). This makes tests robust to stylistic changes.
- **Test Structure**:
  - `test.describe` to group the F3 capabilities.
  - Test 1 (Login): Interacts with login form, asserts dashboard visibility or URL change.
  - Test 2 (Create Event): Interacts with event creation form and asserts the new event appears in the list.
  - Test 3 (View Employees): Navigates to a list/table, checks that employee rows render.
  - Test 4 (Auto-Allocation): Triggers a specific action button and asserts a success indicator (e.g., a toast notification).
  - Test 5 (Export Report): Verifies the report displays and the download triggers correctly using Playwright's `waitForEvent('download')`.

## 3. Caveats
- Exact routes (e.g., `/admin/events`) and locator values (e.g., `data-testid="event-name-input"`) are placeholders. The implementer must align these with the actual application code.
- We assume standard global login or that each test will individually navigate/log in. The recommended structure assumes a simple sequential execution or standard authenticated setup (if Playwright's `storageState` is used, some login steps could be bypassed in later tests, though we include explicit steps for clarity).
- We focus exclusively on the happy path as requested, bypassing edge cases or error states.

## 4. Conclusion
We recommend the following Playwright code structure to be implemented in `c:/Users/yairo/OneDrive/Desktop/new-project/tests/e2e/tier1_feature/f3_admin.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('F3: Admin & Manager Capabilities', () => {

  test('Admin can log in/access admin portal', async ({ page }) => {
    await page.goto('/login'); // Adjust route as needed
    await page.getByTestId('email-input').fill('admin@example.com');
    await page.getByTestId('password-input').fill('admin123');
    await page.getByRole('button', { name: /log in/i }).click();

    await expect(page).toHaveURL(/.*\/admin/);
    await expect(page.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible();
  });

  test('Admin can create an event with a deadline', async ({ page }) => {
    await page.goto('/admin/events');
    await page.getByRole('button', { name: 'Create Event' }).click();
    
    await page.getByTestId('event-title-input').fill('Q4 Planning');
    await page.getByTestId('event-deadline-input').fill('2026-12-31');
    await page.getByRole('button', { name: 'Save' }).click();

    // Verify it appears in the list
    await expect(page.getByText('Q4 Planning')).toBeVisible();
  });

  test('Admin can view a list of registered employees and their status', async ({ page }) => {
    await page.goto('/admin/employees');
    
    const employeeTable = page.getByRole('table', { name: 'Registered Employees' });
    await expect(employeeTable).toBeVisible();
    
    // Assert at least one row exists in the table body
    const rows = employeeTable.locator('tbody tr');
    await expect(rows).not.toHaveCount(0);
  });

  test('Admin can trigger auto-allocation for unassigned users', async ({ page }) => {
    await page.goto('/admin/allocation');
    
    await page.getByRole('button', { name: 'Trigger Auto-Allocation' }).click();

    // Assert a success toast or message
    const successToast = page.getByTestId('toast-message');
    await expect(successToast).toHaveText(/Allocation completed successfully/i);
  });

  test('Admin can view/export an occupancy report', async ({ page }) => {
    await page.goto('/admin/reports');
    
    // Verify report chart/table is visible
    await expect(page.getByTestId('occupancy-report-view')).toBeVisible();
    
    // Verify export triggers a download
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export Report' }).click();
    const download = await downloadPromise;
    
    // Assert download is valid
    expect(download.suggestedFilename()).toBeTruthy();
  });

});
```

## 5. Verification Method
1. The implementer should create the file `tests/e2e/tier1_feature/f3_admin.spec.ts` and drop in the above template.
2. Update the URLs, locators, and test data to match the actual application UI.
3. Run `npx playwright test tests/e2e/tier1_feature/f3_admin.spec.ts` from the root directory to verify all 5 happy-path test cases pass.
