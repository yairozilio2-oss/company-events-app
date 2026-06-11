# Handoff Report: F1 Test Design (Employee Registration & Preferences)

## 1. Observation
- **Requirement Source**: `ORIGINAL_REQUEST.md` (R1).
  - "A responsive RTL web interface (Hebrew) where employees can log in, view their assigned events, set preferences (arrival, kosher food, roommate request), and see their room status."
  - Acceptance Criteria: "Employee can navigate the registration flow and select preferences without errors."
- **Scope**: `SCOPE.md` (M1 - Tier 1 Tests).
  - "5 tests for Employee Registration & Preferences"
  - Architecture: Playwright-based TypeScript E2E test suite.
  - Tests must use `data-testid` or accessible ARIA roles.
- **Test Infrastructure**: `TEST_INFRA.md`.
  - Target structure: `tests/e2e/tier1_feature/f1_registration.spec.ts`.

## 2. Logic Chain
Based on the observations, F1 Tier 1 tests need to cover the happy paths and essential UI interactions for the Employee Portal registration. I have designed 5 Playwright test cases:
1. **Successful Login and Dashboard View**: Verifies the employee can log in successfully and see their assigned events dashboard. Validates that the interface renders in RTL/Hebrew.
2. **Complete Registration Flow without Roommate Request**: Verifies the employee can select an event, fill in basic preferences (e.g., arrival time, kosher food), skip the roommate request step, and submit the registration successfully.
3. **Complete Registration Flow with Roommate Request**: Verifies the employee can select an event, fill preferences, select a specific roommate request, and submit.
4. **Registration Validation**: Verifies that the employee cannot submit the registration if required fields (e.g., arrival preference) are left empty. Asserts that validation error messages are displayed.
5. **View Room Status**: Verifies that the employee can view their room status page post-registration and it accurately reflects a status (e.g., "Pending Approval", "Unassigned", or "Locked").

## 3. Caveats
- Authentication mechanism is not defined in the original requirements. The tests will need to assume a mock login page or a valid session cookie mechanism.
- The specific required fields for the registration form are inferred. Adjustments might be needed once the implementation details are finalized.

## 4. Conclusion
The proposed test design successfully covers the F1 requirements and aligns with the defined Test Infra and Scope. The implementation should be created in the `tests/e2e/tier1_feature/f1_registration.spec.ts` file using Playwright (TypeScript).

### Proposed File Structure
```typescript
// Proposed target: tests/e2e/tier1_feature/f1_registration.spec.ts

import { test, expect } from '@playwright/test';

test.describe('F1: Employee Registration & Preferences', () => {
  test.beforeEach(async ({ page }) => {
    // Setup login/auth here
  });

  test('should successfully log in and view dashboard in RTL/Hebrew', async ({ page }) => { ... });
  
  test('should complete registration without a roommate request', async ({ page }) => { ... });

  test('should complete registration with a roommate request', async ({ page }) => { ... });

  test('should display validation errors for missing required preferences', async ({ page }) => { ... });

  test('should display correct room status after registration', async ({ page }) => { ... });
});
```

## 5. Verification Method
- Execute the Playwright tests using the standard test command: `npx playwright test tests/e2e/tier1_feature/f1_registration.spec.ts`
- Ensure all 5 tests pass when run against a running application instance.
- Ensure the file exists at the specified path and follows TypeScript Playwright conventions.
