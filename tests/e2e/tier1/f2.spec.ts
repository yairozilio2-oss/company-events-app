import { test, expect } from '@playwright/test';

test.describe('F2: Roommate Selection & Approval @tier1', () => {
  test('1. Test user sending a roommate request to a colleague successfully @tier1', async ({ page }) => {
    await page.goto('/roommates');
    await page.fill('#colleagueSearch', 'John Doe');
    await page.click('#searchButton');
    await page.click('#sendRequest-JohnDoe');
    await expect(page.locator('.toast-success')).toHaveText(/Request sent/i);
  });

  test('2. Test target user accepting a request, which immediately locks both users @tier1', async ({ page }) => {
    await page.goto('/requests');
    await page.click('#acceptRequest-JaneDoe');
    await expect(page.locator('.status-badge')).toHaveText(/Locked/i);
  });

  test('3. Test target user rejecting a request, allowing the requester to pick someone else @tier1', async ({ page }) => {
    await page.goto('/requests');
    await page.click('#rejectRequest-JaneDoe');
    await expect(page.locator('.toast-info')).toHaveText(/Request rejected/i);
  });

  test('4. Test UI prevents sending a request to someone with incompatible gender preferences @tier1', async ({ page }) => {
    await page.goto('/roommates');
    await page.fill('#colleagueSearch', 'Alex Incompatible');
    await page.click('#searchButton');
    await expect(page.locator('#sendRequest-AlexIncompatible')).toBeDisabled();
    await expect(page.locator('.incompatible-warning')).toBeVisible();
  });

  test('5. Test that a locked user cannot send or receive new roommate requests @tier1', async ({ page }) => {
    await page.goto('/roommates?status=locked');
    await expect(page.locator('#colleagueSearch')).toBeDisabled();
    await expect(page.locator('#sendRequestContainer')).toBeHidden();
  });
});
