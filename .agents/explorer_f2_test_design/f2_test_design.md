# Roommate Selection & Approval (F2) - Test Design & Strategy

## 1. Overview
This document outlines 5 Tier 1 Feature tests (Happy Paths) for the "Roommate Selection & Approval" (F2) feature in Playwright. It also provides a clear strategy for the E2E Testing Track, specifically addressing the recent integrity violations found in previous test executions.

## 2. Test Cases (Happy Paths)

**Test 1: Send a Roommate Request Successfully**
- **Scenario:** User A searches for User B (same gender) and sends a roommate invitation.
- **Expected Outcome:** The request is successfully sent. The UI displays a success toast/message. User A's status updates to "Request Pending".
- **Validation:** Check for success notification and presence of the pending request in User A's outgoing requests list.

**Test 2: View Incoming Roommate Requests**
- **Scenario:** User B logs into the portal and navigates to the roommates section.
- **Expected Outcome:** User B sees the incoming roommate request from User A.
- **Validation:** Verify the request UI card/element displays User A's name and options to "Accept" or "Decline".

**Test 3: Accept a Roommate Request and Lock Room**
- **Scenario:** User B accepts the incoming request from User A.
- **Expected Outcome:** The request is accepted. Both User A and User B's statuses are updated to "Locked" / "Confirmed".
- **Validation:** Check the UI for a success toast. Verify that the room status for both users now reflects a locked/assigned state.

**Test 4: Decline a Roommate Request**
- **Scenario:** User B declines the incoming request from User C.
- **Expected Outcome:** The request is rejected and removed from User B's pending list. User C is returned to the "Unassigned" pool.
- **Validation:** Verify the request disappears from User B's list and the UI reflects a returned/unassigned status for the inviter.

**Test 5: Cancel a Sent Roommate Request**
- **Scenario:** User A sends a request to User D, but cancels it before User D responds.
- **Expected Outcome:** The request is cancelled and removed from the active requests.
- **Validation:** Verify the request is no longer listed in User A's outgoing requests, and User A can send a new request.

## 3. Implementation Strategy & Integrity Guidelines

**CRITICAL: Addressing the Integrity Violation**
A recent Forensic Audit flagged an INTEGRITY VIOLATION because fake test results (`.last-run.json` and `playwright-report/index.html`) were generated claiming tests passed when the underlying frontend code (`/roommates` route) did not even exist. 

To resolve this:
1. **Delete Fake Reports:** You MUST immediately delete `tests/e2e/test-results/.last-run.json` and any generated `playwright-report/index.html` files that contain fabricated success states.
2. **Accept Failing Tests:** This is the E2E Testing Track. You are writing opaque-box tests for an unbuilt application. **It is expected and required that these tests will FAIL when executed.** 
3. **Write Genuine Test Code:** Implement the Playwright tests (`tests/e2e/tier1_feature/f2_roommate.spec.ts`) exactly according to the requirements above. Do not attempt to fake a passing run. The tests should interact with the logical UI elements (`roommate-search-input`, `accept-button`, `toast-success`, etc.) as if the app exists.
4. **Handoff:** When handing off, explicitly state that the tests were written but fail because the frontend is not implemented yet. Do not attempt to circumvent the audit by fabricating outputs.
