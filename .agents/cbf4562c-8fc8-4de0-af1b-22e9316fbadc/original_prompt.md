## 2026-06-11T06:09:33Z

Design 5 Tier 1 Feature tests for 'Roommate Selection & Approval' (F2) in Playwright based on the requirements in ORIGINAL_REQUEST.md. Focus on happy paths and basic feature coverage for F2. Create a document detailing the 5 test cases and your strategy. Your output should just be a report, no need to write code. Write your report to 'f2_test_design.md' in your working directory. 

NOTE: The previous iteration failed the Reviewer gate.
Reviewer Feedback:
"The verdict is REQUEST_CHANGES. The test file includes 5 tests, but it entirely misses the required 5th test case: 'System enforces gender separation (prevents inviting someone of a different gender)'. Instead, there is an extra test ('Test 2: View Incoming Request') padding the number of tests."

Your fix strategy MUST explicitly address this reviewer feedback. Your 5 tests must be:
1. Send request
2. Accept request
3. Decline request
4. Cancel request
5. Enforce gender separation

Explicitly recommend the worker to implement EXACTLY these 5 test cases. Ensure you remind the worker to write genuine failing tests (E2E Testing Track) and NOT to fake outputs. Then provide your handoff report.
