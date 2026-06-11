# Handoff Report: F4 Notifications E2E Tests Review

## Observation
1. The test file `tests/e2e/tier1_feature/f4_notifications.spec.ts` defines 5 tests under a `test.describe.serial` block.
2. The tests rely on shared, persistent state across sequential test runs. Specifically, Test 2 ("System sends roommate invitation accepted notification") assumes that User B has a pending invitation from User A, which is generated in Test 1.
3. The tests assume pre-existing database state: users `userA@example.com` through `userE@example.com` and `admin@example.com` must exist. User D must already have a booking to cancel in Test 4, and User E must be in a state of pending registration for Test 5. There are no `beforeAll` or `beforeEach` hooks to seed this data or clean up after the tests, meaning the tests cannot be run reliably multiple times on the same database.
4. There is a missing synchronization/assertion step after critical actions. For instance, in Test 1:
   ```typescript
   await pageA.getByRole('button', { name: 'Send Invitation' }).click();
   // User B context immediately created
   ```
   Playwright will not wait for the "Send Invitation" API request to complete before it starts spinning up User B's context. If the server is slow, User B might navigate to `/notifications` before the invitation is actually created in the backend, leading to a flaky test failure.

## Logic Chain
- The use of `serial` execution and shared state across tests violates E2E testing best practices (test isolation). If Test 1 fails, Test 2 will definitely fail.
- The lack of explicit database setup/teardown makes the tests fragile (state leakage). For example, Test 4 cancels a booking for User D. If run a second time without resetting the database, User D will have no booking to cancel, causing Test 4 to fail.
- The lack of assertions immediately following form submissions (like `Send Invitation` or `Confirm Booking`) causes race conditions between the browser sending the request and the subsequent verification steps in the other user's context.

## Caveats
- It is possible that database seeding and teardown are handled globally in a Playwright project setup file or global setup script that was not reviewed here. However, relying on global setup for highly specific state (like User D having a specific booking) is typically discouraged compared to per-test setup.
- We did not execute the tests using `npx playwright test` per the instructions to avoid hanging on user approval, so the race conditions and state issues are identified via static analysis.

## Conclusion
The E2E tests for F4 contain significant architectural flaws regarding test isolation, state management, and synchronization. While they do not appear to contain outright "dummy" or "facade" integrity violations (they genuinely attempt to drive a browser), they are fragile and prone to flakiness and false negatives. 

## Verification Method
1. Run `npx playwright test tests/e2e/tier1_feature/f4_notifications.spec.ts` multiple times in succession to verify that it fails on subsequent runs due to dirty state (e.g., Test 4 failing because the booking is already cancelled).
2. Inject a slight delay in the backend's invitation creation endpoint to verify that Test 1 fails due to the missing assertion after clicking "Send Invitation".
