# F2: Roommate Selection & Approval - Test Design Report

## Overview
This report outlines the design for 5 Tier 1 Feature tests for 'Roommate Selection & Approval' (F2) using Playwright. The tests are based on the requirements detailed in `ORIGINAL_REQUEST.md` (specifically R2 and the Acceptance Criteria).

**IMPORTANT NOTE FOR THE IMPLEMENTING WORKER:** 
You MUST implement **EXACTLY** the 5 test cases listed below. Do not add extra filler tests (such as "View Incoming Request"). The 5th test case MUST be "Enforce gender separation". 

Furthermore, you are working in the **E2E Testing Track**. This means you MUST write genuine failing tests that actually interact with the Playwright browser context. **DO NOT fake outputs** or write empty/mock passing tests. 

---

## The 5 Test Cases

### 1. Send Request
* **Description:** Verify that an employee can successfully search for and send a roommate request to another valid employee.
* **Preconditions:** Two unassigned employees of the same gender exist.
* **Steps:** 
  1. Login as Employee A.
  2. Navigate to the roommate selection/registration portal.
  3. Search for Employee B and send an invitation.
* **Expected Result:** Employee A sees a confirmation that the request was sent, and the system records the pending request.

### 2. Accept Request
* **Description:** Verify that an employee who receives a roommate request can accept it, leading to a locked room status.
* **Preconditions:** Employee A has sent a request to Employee B.
* **Steps:**
  1. Login as Employee B.
  2. Navigate to incoming requests.
  3. Click 'Accept' on Employee A's request.
* **Expected Result:** The request is marked as accepted. As all invited roommates have approved, the room status changes to locked.

### 3. Decline Request
* **Description:** Verify that an employee who receives a roommate request can decline it.
* **Preconditions:** Employee A has sent a request to Employee C.
* **Steps:**
  1. Login as Employee C.
  2. Navigate to incoming requests.
  3. Click 'Decline' on Employee A's request.
* **Expected Result:** The request is removed or marked as declined, and Employee A is notified/updated that the request was declined. Room is not locked.

### 4. Cancel Request
* **Description:** Verify that the sender of a roommate request can cancel it before it is accepted.
* **Preconditions:** Employee A has sent a request to Employee D. Employee D has not yet responded.
* **Steps:**
  1. Login as Employee A.
  2. Navigate to pending sent requests.
  3. Click 'Cancel' on the request to Employee D.
* **Expected Result:** The request is immediately withdrawn. Employee D will no longer see the request, and Employee A can invite someone else.

### 5. Enforce Gender Separation
* **Description:** Verify that the system strictly enforces gender separation rules and prevents an employee from inviting someone of a different gender.
* **Preconditions:** Employee A (Male) and Employee E (Female) exist in the system.
* **Steps:**
  1. Login as Employee A.
  2. Attempt to search for or invite Employee E as a roommate.
* **Expected Result:** The system explicitly prevents the request from being sent (e.g., employee doesn't show in search results, or an error message is displayed stating gender separation rules apply).

---
## Reviewer Feedback Addressed
* **Fix Strategy:** The previous submission was rejected because it missed the gender separation requirement and included an unnecessary view test. This revised design explicitly removes "View Incoming Request" and replaces it with Test Case 5 ("Enforce Gender Separation") to directly align with the core acceptance criteria (`ORIGINAL_REQUEST.md`).
