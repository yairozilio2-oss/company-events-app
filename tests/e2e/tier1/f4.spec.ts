import { test, expect } from '@playwright/test';

test.describe('F4: Notifications (Mock/Log based) @tier1', () => {
  test('1. Test notification is generated/logged when a request is received @tier1', async ({ page }) => {
    await page.goto('/notifications');
    await expect(page.locator('.notification-item', { hasText: /received a roommate request/i })).toBeVisible();
  });

  test('2. Test notification is generated/logged when a request is accepted @tier1', async ({ page }) => {
    await page.goto('/notifications');
    await expect(page.locator('.notification-item', { hasText: /request was accepted/i })).toBeVisible();
  });

  test('3. Test notification is generated/logged when a request is rejected @tier1', async ({ page }) => {
    await page.goto('/notifications');
    await expect(page.locator('.notification-item', { hasText: /request was rejected/i })).toBeVisible();
  });

  test('4. Test notification is generated/logged when an Admin manually modifies an allocation @tier1', async ({ page }) => {
    await page.goto('/notifications');
    await expect(page.locator('.notification-item', { hasText: /admin modified your allocation/i })).toBeVisible();
  });

  test('5. Test notification is generated/logged for an approaching event deadline @tier1', async ({ page }) => {
    await page.goto('/notifications');
    await expect(page.locator('.notification-item', { hasText: /deadline is approaching/i })).toBeVisible();
  });
});
