import { test, expect } from '@playwright/test';

test.describe('Tier 3 Cross-Feature: Registration + Roommate Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure fresh session
    await page.goto('/');
  });

  test('User registers and immediately creates a roommate request', async ({ page }) => {
    // --- Registration ---
    await page.getByTestId('login-email-input').fill('crossuser@example.com');
    await page.getByTestId('login-password-input').fill('Password123!');
    await page.getByTestId('login-submit-button').click();
    await page.getByTestId('nav-registration-link').click();
    await page.getByTestId('dietary-preferences-select').selectOption('vegetarian');
    await page.getByTestId('tshirt-size-select').selectOption('L');
    await page.getByTestId('accessibility-needs-input').fill('None');
    await page.getByTestId('submit-registration-button').click();
    await expect(page.getByTestId('registration-success-message')).toBeVisible();

    // --- Roommate Request ---
    await page.getByTestId('nav-roommate-selection-link').click();
    await page.getByTestId('employee-search-input').fill('Alice');
    await page.getByTestId('search-button').click();
    await page.getByTestId('send-request-button-alice').click();
    await expect(page.getByTestId('request-status')).toHaveText('Request Sent');
  });
});
