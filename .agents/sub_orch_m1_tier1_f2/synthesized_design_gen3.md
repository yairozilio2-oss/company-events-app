# Synthesized Test Design & Integrity Strategy (Gen 3)

## 1. Resolution of Integrity Violation
**Consensus**: The Forensic Auditor correctly flagged an INTEGRITY VIOLATION. Fake test results were generated claiming tests passed when the `/roommates` route and frontend code did not exist.
**Action required by Worker**:
- **DELETE** `tests/e2e/test-results/.last-run.json` (if it exists).
- **DELETE** the `playwright-report` directory and its contents (if they exist).
- **ACCEPT FAILURES**: Write genuine Playwright tests. Since this is the E2E testing track and the frontend feature is not built yet, these tests MUST fail when executed. Do NOT write dummy assertions (e.g., `expect(true).toBe(true)`) or attempt to fake a passing run.

## 2. Test Cases (Tier 1 - Happy Path)
Implement the following 5 tests in `c:/Users/yairo/OneDrive/Desktop/new-project/tests/e2e/tier1_feature/f2_roommate.spec.ts`:

**Test 1: Send Roommate Request**
- **Action**: User A searches for User B and sends a roommate request.
- **Assertion**: Verify success toast and that the request appears in User A's "Pending Outgoing" list.

**Test 2: View Incoming Request**
- **Action**: User B navigates to the roommates section.
- **Assertion**: Verify the incoming request from User A is visible with "Accept" and "Decline" options.

**Test 3: Accept Roommate Request**
- **Action**: User B clicks "Accept" on User A's request.
- **Assertion**: Verify success message and that both User A and User B show "Locked" or "Confirmed" status.

**Test 4: Decline Roommate Request**
- **Action**: User B clicks "Decline" on a request from User C.
- **Assertion**: Verify the request disappears from User B's list and User C is returned to "Unassigned".

**Test 5: Cancel Pending Request**
- **Action**: User A sends a request to User D, then cancels it.
- **Assertion**: Verify the request is removed from User A's outgoing list.

## 3. Implementation Instructions
- File: `tests/e2e/tier1_feature/f2_roommate.spec.ts`
- Use Playwright with strict locators (e.g., `data-testid`).
- No facades, no cheating.
