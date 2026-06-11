# Playwright Test Design for F2: Roommate Selection & Approval

## Overview & Strategy
This document details the design for 5 Tier 1 End-to-End (E2E) tests for the **Roommate Selection & Approval** feature (F2) in Playwright. Based on the system requirements in `ORIGINAL_REQUEST.md` and explicit reviewer feedback, the strategy ensures comprehensive test coverage focusing on the bidirectional approval system and the strict enforcement of gender separation. 

The strategy includes verifying the happy path flows for inviting and responding to roommate requests, as well as the system's core business rule regarding gender separation.

## IMPORTANT NOTE FOR IMPLEMENTERS
**DO NOT FAKE TEST OUTPUTS.**
You must implement genuine failing tests (E2E Testing Track) that interact with the actual application code. The previous iteration failed the Reviewer gate because it did not strictly adhere to the required test cases and faked outputs. Make sure to implement EXACTLY the 5 tests outlined below, and ensure they run and correctly assert against the live application UI and state.

## The 5 Required Test Cases

### 1. Send Request
*   **Description:** Verify that an employee can successfully search for and send a roommate invitation to an eligible colleague.
*   **Preconditions:** Two eligible employees of the same gender are logged in or available in the system.
*   **Steps:**
    1. Log in as Employee A.
    2. Navigate to the roommate selection section.
    3. Search for Employee B.
    4. Click to send a roommate request.
*   **Expected Result:** The request is successfully sent. The UI updates to show the pending request. A notification is triggered for Employee B.

### 2. Accept Request
*   **Description:** Verify that an employee receiving a roommate request can accept it, locking the room if all parties approve.
*   **Preconditions:** Employee B has a pending roommate request from Employee A.
*   **Steps:**
    1. Log in as Employee B.
    2. Navigate to pending roommate requests/notifications.
    3. Locate the request from Employee A.
    4. Click 'Accept'.
*   **Expected Result:** The request is accepted. The roommate pair is confirmed, and the room status updates to 'locked' (as all invited roommates have approved).

### 3. Decline Request
*   **Description:** Verify that an employee receiving a roommate request can decline it, restoring both employees to an unassigned status.
*   **Preconditions:** Employee B has a pending roommate request from Employee A.
*   **Steps:**
    1. Log in as Employee B.
    2. Navigate to pending roommate requests.
    3. Locate the request from Employee A.
    4. Click 'Decline'.
*   **Expected Result:** The request is declined. Employee A receives a notification of the decline. Neither employee is locked into a room, and they can search for other roommates.

### 4. Cancel Request
*   **Description:** Verify that the sender of a roommate request can cancel it before it is accepted.
*   **Preconditions:** Employee A has sent a request to Employee B, but Employee B has not yet responded.
*   **Steps:**
    1. Log in as Employee A.
    2. Navigate to the pending sent requests section.
    3. Locate the sent request to Employee B.
    4. Click 'Cancel Request'.
*   **Expected Result:** The request is immediately withdrawn. It is removed from Employee A's pending list and Employee B's incoming requests. Both employees remain unassigned.

### 5. Enforce Gender Separation
*   **Description:** Verify that the system strictly prevents an employee from inviting someone of a different gender, adhering to the application's core rules.
*   **Preconditions:** Employee C (Male) and Employee D (Female) exist in the system.
*   **Steps:**
    1. Log in as Employee C.
    2. Navigate to the roommate selection section.
    3. Attempt to search for and select Employee D.
    4. Try to send a roommate request.
*   **Expected Result:** The system enforces gender separation. The UI either hides Employee D from the search results, disables the invite button, or shows a clear validation error stating that cross-gender roommate requests are not allowed. The request must NOT be sent.
