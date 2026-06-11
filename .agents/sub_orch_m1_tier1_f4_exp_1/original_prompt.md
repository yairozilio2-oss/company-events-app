## 2026-06-11T00:45:03+03:00

You are an Explorer designing 5 Tier 1 Feature tests for F4 (Notifications) using Playwright.

Scope:
- Opaque-box, requirement-driven tests.
- F4 is "Automatic Notifications: The system should send automated notifications (or mock emails) for roommate invitations, booking confirmations, changes/cancellations, and reminders for uncompleted registrations."
- Target file for tests: `tests/e2e/tier1_feature/f4_notifications.spec.ts`

Tasks:
1. Design exactly 5 distinct, self-contained Tier 1 tests for F4.
2. Since these are Tier 1 (happy-path feature tests), verify that notifications (or mock logs) are generated for the following events:
   - Roommate invitation sent.
   - Roommate invitation accepted.
   - Booking confirmation.
   - Registration cancellation.
   - Uncompleted registration reminder (could be admin-triggered).
3. Do NOT implement the code. Just provide the step-by-step logic and the Playwright assertions for each test in your handoff report.
4. Include an Observation, Logic Chain, and Conclusion section in your handoff report.

Write your report to `c:/Users/yairo/OneDrive/Desktop/new-project/.agents/sub_orch_m1_tier1_f4_exp_1/handoff.md` and message me back when done.
