# Playwright Test Design for 'Roommate Selection & Approval' (F2)

## Overview
This document details 5 Tier 1 Feature tests for the "Roommate Selection & Approval" (F2) feature, covering basic functionality and happy paths based on the `ORIGINAL_REQUEST.md` requirements.

### Scope & Constraints
- **Bidirectional Approval:** Rooms are locked only when all invited roommates approve.
- **Gender Separation:** Employees of different genders cannot share a room.
- **Language/Layout:** The UI is expected to be responsive RTL (Hebrew), which should be considered in locator strategies (e.g., using test IDs or matching Hebrew text).

---

## Test Cases

### Test Case 1: Send Roommate Request Successfully
**Goal:** Verify that an employee can find another eligible employee and send a roommate request.
- **Pre-conditions:** Two employees of the same gender (Employee A, Employee B) exist and are unassigned.
- **Steps:**
  1. Log in to the Employee Portal as Employee A.
  2. Navigate to the Roommate Selection / Preferences section.
  3. Search for Employee B using a search input.
  4. Click the "Invite" (or equivalent Hebrew) button next to Employee B.
- **Expected Results:**
  - A success notification is displayed.
  - The request status for Employee B appears as "Pending" in Employee A's portal.

### Test Case 2: Accept Roommate Request & Lock Room
**Goal:** Verify that accepting a request finalizes the match and changes the room status to locked.
- **Pre-conditions:** Employee A has sent a request to Employee B.
- **Steps:**
  1. Log in to the Employee Portal as Employee B.
  2. Navigate to the pending roommate requests section.
  3. Locate the invitation from Employee A and click "Accept".
- **Expected Results:**
  - The request disappears from the pending list.
  - The room status updates to "Locked" (or equivalent status) for Employee B.
  - (Implicit) Logging back in as Employee A would also show the room as "Locked".

### Test Case 3: Enforce Gender Separation Rules
**Goal:** Verify that the system prevents employees of different genders from sharing a room.
- **Pre-conditions:** Employee A (Male) and Employee C (Female) exist.
- **Steps:**
  1. Log in to the Employee Portal as Employee A.
  2. Navigate to the Roommate Selection section.
  3. Attempt to search for Employee C.
- **Expected Results:**
  - Employee C does not appear in the search results, OR if displayed, the "Invite" button is disabled and clearly indicates a gender mismatch error when hovered or clicked.

### Test Case 4: Decline Roommate Request
**Goal:** Verify the happy path of a user deciding not to accept an invitation.
- **Pre-conditions:** Employee A sent an invite to Employee D (both same gender).
- **Steps:**
  1. Log in to the Employee Portal as Employee D.
  2. Navigate to the pending roommate requests section.
  3. Locate the invitation from Employee A and click "Decline".
- **Expected Results:**
  - The request is removed from Employee D's UI.
  - The room remains unlocked for both users.
  - Employee A's portal updates to show the request was declined.

### Test Case 5: Locked Room Prevents Further Invitations
**Goal:** Verify that once a room is successfully matched and locked, users cannot invite additional roommates (assuming standard 2-person capacity, or once fully locked).
- **Pre-conditions:** Employee A and Employee B have mutually accepted requests, and their room is "Locked".
- **Steps:**
  1. Log in to the Employee Portal as Employee A.
  2. Navigate to the Roommate Selection section.
- **Expected Results:**
  - The UI clearly indicates that the room is locked.
  - Search and invitation inputs/buttons are disabled, hidden, or removed, preventing any further roommate requests from being sent.

---

## Playwright Strategy
1. **Mocking/Seeding Data:** Use API fixtures or database seeding before tests to prepare users with specific genders and request states (e.g., a pending request already existing for Test Case 2).
2. **Locators:** Use stable `data-testid` attributes (e.g., `data-testid="invite-button"`, `data-testid="room-status"`) instead of relying on Hebrew text which might change.
3. **Authentication:** Use Playwright's `browserContext.storageState` to log in quickly if testing multiple roles in a single test, or use multiple contexts (`browser.newContext()`) to test the bidirectional flow (Employee A invites, Employee B accepts) simultaneously in real-time.
