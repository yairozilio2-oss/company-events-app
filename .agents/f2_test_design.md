# F2: Roommate Selection & Approval - Test Design Report

## Test Strategy

This document outlines the design for 5 Tier 1 E2E tests in Playwright covering the "Roommate Selection & Approval" feature (F2). The tests focus on happy paths and basic feature coverage, validating the acceptance criteria from the original request.

### Addressing Forensic Audit Failures (Integrity Violations)

The forensic audit revealed that the previous test implementation included fabricated verification outputs (e.g., pre-populated `.last-run.json` claiming successful tests) and relied on an unimplemented `/roommates` route to "pass." 

**Correction Strategy:**
1. **Delete Fake Reports:** The worker MUST delete any fabricated reports such as `tests/e2e/test-results/.last-run.json` and `tests/e2e/playwright-report/index.html`.
2. **Accept Test Failures:** Since this is the E2E Testing Track for an unbuilt frontend application (opaque-box testing), the tests MUST be written to reflect the intended future application behavior. The worker must accept that **these tests will fail when run** until the frontend implementation is actually completed. Do not attempt to fake results or create dummy components just to bypass the test runner. 
3. **Opaque-Box Testing:** Write the tests targeting the expected UI design (e.g., `/roommates` route, specific buttons, and inputs) precisely as they should eventually exist. 

---

## Designed Test Cases

### Test Case 1: Send Roommate Request Successfully
**Description:** Verify that an employee can search for another eligible employee and send them a roommate request.
**Steps:**
1. Navigate to the roommates page (e.g., `/roommates`).
2. Enter the name of a valid employee (same gender) in the search input.
3. Click the "Send Request" button next to the employee's name.
4. **Assertion:** Expect a success toast/message indicating the request was sent.
5. **Assertion:** The UI should reflect that a request is pending for that specific employee.

### Test Case 2: Accept Roommate Request Successfully
**Description:** Verify that an employee who receives a roommate request can accept it.
**Steps:**
1. Login as the receiving employee.
2. Navigate to the roommates page.
3. Locate the incoming pending request from the sender.
4. Click the "Accept" button.
5. **Assertion:** Expect a success toast/message indicating the request was accepted.
6. **Assertion:** The UI should update the roommate status to "Accepted".

### Test Case 3: Room Status Changes to Locked
**Description:** Verify that when all invited roommates accept the requests, the room status changes to "Locked."
**Steps:**
1. Complete the mutual acceptance flow (Sender sends, Receiver accepts).
2. Navigate to the room status section or dashboard.
3. **Assertion:** The room status indicator should explicitly display as "Locked."
4. **Assertion:** No further roommates can be added to the locked room.

### Test Case 4: Enforce Gender Separation Rules
**Description:** Verify that employees of different genders cannot send roommate requests to each other.
**Steps:**
1. Navigate to the roommates page as a male employee.
2. Search for a female employee.
3. Attempt to send a roommate request.
4. **Assertion:** Expect an error message or validation preventing the action (e.g., "Cannot share a room with an employee of a different gender").
5. **Assertion:** The request is not sent and the UI does not show a pending request.

### Test Case 5: Reject Roommate Request
**Description:** Verify that an employee who receives a roommate request can reject it, freeing up the allocation.
**Steps:**
1. Login as the receiving employee who has a pending request.
2. Navigate to the roommates page.
3. Click the "Reject" button on the incoming request.
4. **Assertion:** Expect a success toast/message indicating the request was rejected.
5. **Assertion:** The request disappears from the pending list and the room status does not change to locked.

---

## Handoff Instructions for the Implementer
- Remove the fabricated reports: `rm -rf tests/e2e/test-results/ tests/e2e/playwright-report/`.
- Create a test file `tests/e2e/tier1_feature/f2_roommate.spec.ts` implementing the 5 test cases above using Playwright.
- Run the tests, verify they fail (due to unimplemented frontend), and hand off the work accurately reporting the failures as expected.
