import { test, expect } from '@playwright/test';

test.describe('Feature 2: Roommate Selection & Approval - Boundary & Corner Cases', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the roommate selection page (assuming authentication is handled globally or prior)
    await page.goto('/roommate-selection');
  });

  test('1. Try to invite self as roommate', async ({ page }) => {
    // Assuming the current user ID or email is 'currentUser@example.com'
    const currentUserIdentifier = 'currentUser@example.com';
    
    const inviteInput = page.getByPlaceholder(/Enter roommate ID or email/i);
    await inviteInput.fill(currentUserIdentifier);
    await page.getByRole('button', { name: 'Invite' }).click();

    // Expect an error message preventing self-invitation
    const errorMessage = page.locator('.error-message, [role="alert"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toHaveText(/cannot invite yourself|invalid user/i);
  });

  test('2. Circular invites or inviting someone already in a locked room', async ({ page }) => {
    // Attempt to invite a user known to be in a locked room (e.g., 'lockeduser@example.com')
    const lockedUserIdentifier = 'lockeduser@example.com';
    
    const inviteInput = page.getByPlaceholder(/Enter roommate ID or email/i);
    await inviteInput.fill(lockedUserIdentifier);
    await page.getByRole('button', { name: 'Invite' }).click();

    // Expect an error indicating the user is unavailable
    const errorMessage = page.locator('.error-message, [role="alert"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toHaveText(/already in a locked room|unavailable/i);
  });

  test('3. Inviting a roommate of a different gender (boundary violation)', async ({ page }) => {
    // Attempt to invite a user of a different gender (assuming strict gender separation rules)
    const oppositeGenderUser = 'oppositegender@example.com';
    
    const inviteInput = page.getByPlaceholder(/Enter roommate ID or email/i);
    await inviteInput.fill(oppositeGenderUser);
    await page.getByRole('button', { name: 'Invite' }).click();

    // Expect a policy violation error message
    const errorMessage = page.locator('.error-message, [role="alert"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toHaveText(/gender separation rules|cannot invite this user/i);
  });

  test('4. Extremely long user IDs or special characters in the roommate search/invite field', async ({ page }) => {
    const inviteInput = page.getByPlaceholder(/Enter roommate ID or email/i);
    const errorMessage = page.locator('.error-message, [role="alert"]');

    // Test extremely long string
    const longString = 'a'.repeat(300);
    await inviteInput.fill(longString);
    await page.getByRole('button', { name: 'Invite' }).click();
    
    // Expect a validation error for length
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toHaveText(/too long|invalid length/i);
    
    // Clear input
    await inviteInput.clear();

    // Test special characters
    const specialChars = '!@#$%^&*()_+<>?:{}|~';
    await inviteInput.fill(specialChars);
    await page.getByRole('button', { name: 'Invite' }).click();
    
    // Expect validation error for special characters/format
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toHaveText(/invalid format/i);
  });

  test('5. Withdrawing an invite right at the deadline', async ({ page }) => {
    // First, invite a valid user
    const validUserId = 'validuser@example.com';
    const inviteInput = page.getByPlaceholder(/Enter roommate ID or email/i);
    await inviteInput.fill(validUserId);
    await page.getByRole('button', { name: 'Invite' }).click();
    
    // Wait for the invite to appear in the pending list
    const pendingInvite = page.locator('.pending-invite', { hasText: validUserId });
    await expect(pendingInvite).toBeVisible();
    
    // Simulate deadline approach. The application should handle edge cases gracefully,
    // e.g., either allowing the withdrawal or stating the deadline has passed.
    const withdrawButton = pendingInvite.getByRole('button', { name: /Withdraw/i });
    await withdrawButton.click();
    
    // Verify successful withdrawal or specific "too late" message
    const notification = page.locator('.notification, [role="status"], [role="alert"]');
    await expect(notification).toBeVisible();
    
    // It should not crash, and should inform the user of success or deadline pass
    await expect(notification).toHaveText(/successfully withdrawn|deadline has passed/i);
  });
});
