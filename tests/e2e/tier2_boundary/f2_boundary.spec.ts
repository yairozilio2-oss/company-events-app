import { test, expect } from '@playwright/test';

test.describe('F2 Boundary & Corner Case Tests: Roommate Selection', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the roommate selection page before each test
    // Assuming user is logged in
    await page.goto('/roommates');
  });

  test('Test 1: Prevent Self-Invitation', async ({ page }) => {
    // Action: Logged-in user searches for their own name.
    await page.getByTestId('roommate-search-input').fill('My Own Name');
    await page.getByTestId('search-submit-btn').click();
    // Auto-waiting assertions enforcing 0 results
    await expect(page.getByTestId('search-result-item')).toHaveCount(0);
    await expect(page.getByTestId('no-results-message')).toBeVisible();
  });

  test('Test 2: Prevent Inviting an Already Locked User', async ({ page }) => {
    // Action: User searches for an employee who is already in a "Locked" room.
    await page.getByTestId('roommate-search-input').fill('Locked User');
    await page.getByTestId('search-submit-btn').click();
    const searchResult = page.getByTestId('search-result-item').filter({ hasText: 'Locked User' });
    await expect(searchResult).toBeVisible();
    // Strictly expect the button to be disabled
    await expect(searchResult.getByTestId('send-request-btn')).toBeDisabled();
  });

  test('Test 3: Auto-Cancellation of Pending Requests Upon Locking', async ({ page }) => {
    // Action: User accepts an incoming request, causing their room to become "Locked".
    await page.goto('/roommates/requests');
    const incomingRequest = page.getByTestId('incoming-request-item').first();
    // Accept request
    await incomingRequest.getByTestId('accept-request-btn').click();
    await expect(page.getByTestId('room-status-label')).toHaveText('Locked');
    // Navigate to outgoing requests and assert absence of 'Pending' requests
    await page.goto('/roommates/outgoing');
    await expect(page.getByTestId('outgoing-request-item').filter({ hasText: 'Pending' })).toHaveCount(0);
    await expect(page.getByTestId('outgoing-request-item').filter({ hasText: 'Cancelled' })).toHaveCount(1);
  });

  test('Test 4: Graceful Handling of Mutual Invitations', async ({ page }) => {
    // Action: User searches for User A (who already sent an invitation to them) and clicks "Send Request".
    await page.getByTestId('roommate-search-input').fill('User A');
    await page.getByTestId('search-submit-btn').click();
    const searchResult = page.getByTestId('search-result-item').filter({ hasText: 'User A' });
    
    await searchResult.getByTestId('send-request-btn').click();
    // Strict expectation of success message
    await expect(page.getByTestId('toast-success')).toHaveText('Room formed successfully');
    await expect(page.getByTestId('room-status-label')).toHaveText('Locked');
  });

  test('Test 5: Prevent Sending Requests Exceeding Room Capacity', async ({ page }) => {
    // Action: User attempts to send an outgoing request when they are already at the maximum allowed pending requests limit.
    await page.getByTestId('roommate-search-input').fill('User Exceeding Limit');
    await page.getByTestId('search-submit-btn').click();
    const searchResult = page.getByTestId('search-result-item').filter({ hasText: 'User Exceeding Limit' });
    
    await searchResult.getByTestId('send-request-btn').click();
    // Strict expectation of error toast
    await expect(page.getByTestId('toast-error')).toHaveText('Maximum outgoing requests reached');
    // Ensure the request wasn't actually sent by verifying the button didn't change to "Pending"
    await expect(searchResult.getByTestId('send-request-btn')).toBeVisible();
  });
});
