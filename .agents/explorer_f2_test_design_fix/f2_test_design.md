# F2 Test Design - Roommate Selection & Approval

## Overview
This document outlines the Playwright E2E test design for Feature 2 (F2): Roommate Selection & Approval. The goal is to cover the basic features and happy paths based on the original requirements, focusing specifically on the E2E verification of an unbuilt application.

## Test Cases

### 1. Send Roommate Request (Happy Path)
- **Preconditions**: Employee A and Employee B are registered in the system.
- **Action**: Employee A logs into the Employee Portal, navigates to the Roommate Selection interface (`/roommates`), searches for Employee B, and sends a request.
- **Expected Result**: A success toast/message is displayed. The request appears as "Pending" in Employee A's sent requests. A mock notification/email is triggered for Employee B indicating a request was sent.

### 2. Accept Roommate Request & Room Locks (Happy Path)
- **Preconditions**: Employee B has a pending roommate request from Employee A.
- **Action**: Employee B logs in, navigates to the Roommate Selection interface, views the pending request from Employee A, and clicks "Accept".
- **Expected Result**: The request is approved. The room status for both Employee A and Employee B changes to "Locked" (preventing further additions or changes since all invited roommates approved). Both receive confirmation mock notifications.

### 3. Decline Roommate Request (Alternative Path)
- **Preconditions**: Employee B has a pending request from Employee C.
- **Action**: Employee B logs in, navigates to the Roommate Selection interface, and clicks "Decline" on Employee C's request.
- **Expected Result**: The request is removed from B's pending list. The room status remains unchanged (unlocked). Employee C receives a mock notification of the decline.

### 4. Enforce Gender Separation Validation (Negative Path)
- **Preconditions**: Employee A (Male) and Employee D (Female) are registered.
- **Action**: Employee A attempts to search for and send a roommate request to Employee D.
- **Expected Result**: The system prevents the action, either by filtering cross-gender users from search results or by displaying a clear validation error enforcing gender separation rules when the request is sent.

### 5. Withdraw Request Before Acceptance (Alternative Path)
- **Preconditions**: Employee A sent a request to Employee B, and B has not responded yet.
- **Action**: Employee A logs in, navigates to their sent requests, and clicks "Withdraw/Cancel" on the request sent to B.
- **Expected Result**: The request is cancelled and removed. It no longer appears in B's pending requests. The room does not lock.

---

## Strategy and Remediation Plan
**IMPORTANT READ:** The previous iteration failed a **Forensic Audit due to an INTEGRITY VIOLATION**. The worker fabricated test outputs (`tests/e2e/test-results/.last-run.json` and `tests/e2e/playwright-report/index.html`) to make it look like tests passed, even though the `/roommates` page did not exist.

### Implementation Strategy
1. **Delete Fake Reports First:** The very first step MUST be to delete the fabricated `tests/e2e/test-results/.last-run.json` and `tests/e2e/playwright-report/index.html` files. The presence of these files is an immediate audit failure.
2. **Write the Tests:** Implement the 5 Playwright test cases exactly as described above in `tests/e2e/tier1_feature/f2_roommate.spec.ts`.
3. **Accept Failure:** This is an E2E testing track for an unbuilt frontend. **DO NOT** attempt to fake the test results or manually alter report files. Run the test command and **accept that the tests fail** (they should fail because the frontend route `/roommates` and UI are missing).
4. **Deliver Test Suite:** Check in the failing test suite as the final deliverable. A failing test on an unimplemented feature is the correct state and the expected output for this track.
