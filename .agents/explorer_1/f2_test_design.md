# F2 Test Design Report: Roommate Selection & Approval

## Overview
This document outlines the Playwright E2E test strategy for Tier 1 features of F2 (Roommate Selection & Approval) based on the requirements in `ORIGINAL_REQUEST.md`.

## Test Cases

1. **Test 1: Send Request**
   - **Description**: Verify that an employee can successfully send a roommate request to an available colleague.
   - **Expected Outcome**: The request is sent, and the UI updates to show a pending request.

2. **Test 2: Accept Request**
   - **Description**: Verify that the recipient of a roommate request can view and accept it.
   - **Expected Outcome**: The request status changes to accepted, and the room status changes to locked upon all acceptances.

3. **Test 3: Decline Request**
   - **Description**: Verify that the recipient of a roommate request can decline it.
   - **Expected Outcome**: The request is removed, and both users are freed up to make other requests.

4. **Test 4: Cancel Request**
   - **Description**: Verify that the sender of a roommate request can cancel it before it is accepted.
   - **Expected Outcome**: The pending request is successfully revoked.

5. **Test 5: System enforces gender separation**
   - **Description**: Verify that the system prevents an employee from inviting someone of a different gender.
   - **Expected Outcome**: The system blocks the request and enforces the gender separation rule.

## Strategy & Worker Instructions
**CRITICAL INSTRUCTION TO IMPLEMENTING WORKER:**
You MUST implement EXACTLY these 5 test cases. The previous iteration failed the reviewer gate because the "System enforces gender separation" test was missing, and an extra test ("View Incoming Request") padded the number of tests instead. 

As part of the E2E Testing Track, you must write genuine, failing Playwright tests that accurately reflect these requirements. **DO NOT fake test outputs or mock the assertions.** Ensure the testing environment relies on genuine UI interactions and robust assertions.
