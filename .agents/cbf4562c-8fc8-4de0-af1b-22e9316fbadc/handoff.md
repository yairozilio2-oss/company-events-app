# Handoff Report: F2 Test Design

## Observation
- The user requested a test design report for 5 Tier 1 Feature tests in Playwright for 'Roommate Selection & Approval' (F2).
- The Reviewer explicitly rejected the previous iteration because it missed the 5th test case ("System enforces gender separation") and padded the tests with a "View Incoming Request" test.
- `ORIGINAL_REQUEST.md` specifies that the room status should change to locked upon all acceptances and that "gender separation rules are enforced (employees of different genders cannot share a room)".
- The required 5 tests are exactly: 1) Send request, 2) Accept request, 3) Decline request, 4) Cancel request, 5) Enforce gender separation.

## Logic Chain
1. Read `ORIGINAL_REQUEST.md` to understand the Acceptance Criteria for Roommate Selection.
2. Verified that the 5 explicitly requested test cases map perfectly to the system requirements (bidirectional approval, room locking, and strict gender separation).
3. Drafted `f2_test_design.md` detailing these exact 5 test cases.
4. Added an explicit warning to the document to address the Reviewer's concern regarding genuine tests, instructing the implementer to write true E2E failing tests and not to fake the outputs.

## Caveats
- No code was written as per the instruction ("your output should just be a report, no need to write code").
- The exact UI selectors and application state mechanisms will depend on the implementation details that the worker determines when writing the Playwright tests.

## Conclusion
The test design report has been successfully generated at `c:\Users\yairo\OneDrive\Desktop\new-project\.agents\cbf4562c-8fc8-4de0-af1b-22e9316fbadc\f2_test_design.md`. It strictly adheres to the 5 requested test cases and includes explicit instructions for the implementer to avoid faking test outputs.

## Verification Method
- Review the generated file `f2_test_design.md` in this directory.
- Verify that it contains the 5 mandated test headings.
- Verify that the 'IMPORTANT NOTE FOR IMPLEMENTERS' section explicitly warns against faking outputs and requires writing genuine failing E2E tests.
