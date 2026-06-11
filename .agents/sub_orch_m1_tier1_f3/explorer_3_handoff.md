# Handoff: F3 Admin & Manager Capabilities Test Strategy

## Observation
The user requested a strategy to implement 5 Playwright test cases for Tier 1 Feature coverage of F3 (Admin & Manager Capabilities).
The test cases are:
1. Admin can log in/access admin portal
2. Admin can create an event with a deadline
3. Admin can view a list of registered employees and their status
4. Admin can trigger auto-allocation for unassigned users
5. Admin can view/export an occupancy report

The target file is `c:/Users/yairo/OneDrive/Desktop/new-project/tests/e2e/tier1_feature/f3_admin.spec.ts`.
The tests must be opaque-box, requirement-driven, use TypeScript and Playwright, and focus on the happy path using `data-testid` or ARIA roles where possible.

## Logic Chain
1. To ensure tests are opaque-box and requirement-driven, we should rely entirely on visible UI elements and standard user interactions, avoiding direct database manipulation or internal state assertions.
2. We can achieve this by targeting `data-testid` attributes or semantic ARIA roles (e.g., `page.getByRole('button', { name: 'Login' })`).
3. **Test 1: Admin Login**
   - Strategy: Navigate to the login page, fill in admin credentials, submit, and verify the admin dashboard is visible.
   - Assertions: `expect(page.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible()`
4. **Test 2: Create an event with a deadline**
   - Strategy: From the dashboard, navigate to the event creation form, fill in event details (name, date, deadline), and submit.
   - Assertions: `expect(page.getByTestId('event-item-X')).toBeVisible()` or verifying a success toast notification.
5. **Test 3: View registered employees and status**
   - Strategy: Navigate to an event's detail page, click on the registration list/tab.
   - Assertions: `expect(page.getByRole('table', { name: 'Registrations' })).toBeVisible()`, and check for specific employee rows.
6. **Test 4: Trigger auto-allocation**
   - Strategy: On the event's allocation page, click the 'Auto-Allocate' button and confirm.
   - Assertions: Check that the status of unassigned users changes to 'Allocated' or a success message is displayed.
7. **Test 5: View/Export occupancy report**
   - Strategy: Navigate to the reports section, select the event, and click 'Export'.
   - Assertions: Wait for the download event and verify the downloaded file name/type, or verify the report table is rendered correctly on screen.

## Caveats
- Exact `data-testid` values and page URLs are assumed, as the implementation may vary. The final implementer will need to align these with the actual app structure.
- We assume standard login flow without complex MFA for testing purposes.
- We assume a standard table or list layout for employee status and reports.

## Conclusion
The recommended strategy defines 5 discrete test blocks in Playwright. Each block leverages `getByRole` and `getByTestId` to interact with the application opaquely. The target test file is structured to group these tests under a single `describe` block for F3, possibly utilizing `beforeEach` to establish the admin session if state isn't preserved across tests.

## Verification Method
1. The implementer should write the tests in `tests/e2e/tier1_feature/f3_admin.spec.ts` according to this strategy.
2. Run `npx playwright test tests/e2e/tier1_feature/f3_admin.spec.ts` to verify the tests pass against the application.
3. Review the test file to ensure assertions use semantic locators and testids.
