# F3: Admin & Manager Capabilities - Playwright Test Strategy

## 1. Observation
The objective is to recommend an opaque-box, requirement-driven strategy for implementing 5 Playwright test cases (Tier 1 Feature coverage) for F3: Admin & Manager Capabilities. The tests focus on happy paths and should be placed in `tests/e2e/tier1_feature/f3_admin.spec.ts`. The target framework is TypeScript using Playwright, and best practices dictate using robust selectors like `data-testid` or ARIA roles.

## 2. Logic Chain
Based on the 5 required features, the recommended test structure is as follows:

**Test 1: Admin can log in/access admin portal**
- **Action**: Navigate to login page, enter admin credentials, and click submit.
- **Selectors**: `[data-testid='admin-login-email']`, `[data-testid='admin-login-password']`, `[data-testid='admin-login-submit']`.
- **Assertion**: Expect URL to contain `/admin/dashboard` or expect `role="heading" name="Admin Dashboard"` to be visible.

**Test 2: Admin can create an event with a deadline**
- **Action**: From the admin dashboard, navigate to Events, click "Create Event", fill in title and deadline, and save.
- **Selectors**: `[data-testid='nav-events']`, `[data-testid='create-event-btn']`, `[data-testid='event-title-input']`, `[data-testid='event-deadline-input']`, `[data-testid='save-event-btn']`.
- **Assertion**: Expect the new event title to be visible in the events list (`role="cell"`).

**Test 3: Admin can view a list of registered employees and their status**
- **Action**: Navigate to a specific event's details page and open the registration list.
- **Selectors**: `[data-testid='view-event-btn']`, `[data-testid='registration-list']`.
- **Assertion**: Expect `[data-testid='employee-row']` to have a count > 0, and expect text like "Registered" or "Waitlisted" to be visible within the rows.

**Test 4: Admin can trigger auto-allocation for unassigned users**
- **Action**: On an event's details page, click the Auto-Allocate button.
- **Selectors**: `[data-testid='auto-allocate-btn']`.
- **Assertion**: Expect a success toast `[data-testid='toast-success']` (e.g., "Allocation complete") or expect the status of unassigned users to change to "Allocated".

**Test 5: Admin can view/export an occupancy report**
- **Action**: Navigate to the Reports section, select "Occupancy Report", and trigger an export.
- **Selectors**: `[data-testid='nav-reports']`, `[data-testid='export-occupancy-btn']`.
- **Assertion**: Expect the Playwright `page.waitForEvent('download')` to resolve successfully, confirming the export was triggered.

## 3. Caveats
- As this is an opaque-box strategy, the specific UI structure (and the exact `data-testid` strings) are hypothetical. The developers implementing the application must ensure these `data-testid` attributes are mapped correctly in the frontend code.
- Test 5 assumes the export functionality uses a standard file download mechanism recognizable by Playwright (`page.waitForEvent('download')`).

## 4. Conclusion
Create the test file at `tests/e2e/tier1_feature/f3_admin.spec.ts`. Use a single `test.describe('F3: Admin & Manager Capabilities')` block containing the 5 `test(...)` blocks described above. Rely exclusively on `page.getByTestId(...)` and `page.getByRole(...)` to keep the selectors decoupled from styling or structure changes.

## 5. Verification Method
- **Implementer**: Create the proposed file structure.
- **Validation Command**: Run `npx playwright test tests/e2e/tier1_feature/f3_admin.spec.ts`
- **Invalidation Condition**: If the tests fail to compile, the TypeScript structure is incorrect. If the tests fail at runtime, the application either lacks the functionality or is missing the expected `data-testid` hooks.
