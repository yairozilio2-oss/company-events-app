import { test, expect } from '@playwright/test';

test.describe('F3: Admin & Manager Capabilities @tier1', () => {
  test('1. Test Admin login and viewing the real-time occupancy/dashboard stats @tier1', async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('#adminUsername', 'admin');
    await page.fill('#adminPassword', 'password');
    await page.click('#loginButton');
    await expect(page.locator('#dashboard-stats')).toBeVisible();
    await expect(page.locator('.occupancy-rate')).not.toBeEmpty();
  });

  test('2. Test Admin manually allocating a room to unassigned employees @tier1', async ({ page }) => {
    await page.goto('/admin/allocation');
    await page.click('#selectUnassigned-UserA');
    await page.click('#assignRoomButton');
    await page.selectOption('#roomSelect', 'Room 101');
    await page.click('#confirmAllocation');
    await expect(page.locator('#allocationSuccess')).toBeVisible();
  });

  test('3. Test Admin running the auto-allocation action and validating the assigned results @tier1', async ({ page }) => {
    await page.goto('/admin/allocation');
    await page.click('#runAutoAllocation');
    await expect(page.locator('.auto-allocation-results')).toBeVisible();
    await expect(page.locator('.unassigned-count')).toHaveText('0');
  });

  test('4. Test Admin overriding/breaking an existing accepted roommate pair @tier1', async ({ page }) => {
    await page.goto('/admin/pairs');
    await page.click('#breakPair-UserA-UserB');
    await page.click('#confirmBreak');
    await expect(page.locator('.pair-broken-alert')).toBeVisible();
  });

  test('5. Test Admin exporting the final occupancy report @tier1', async ({ page }) => {
    await page.goto('/admin/dashboard');
    const downloadPromise = page.waitForEvent('download');
    await page.click('#exportReport');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('occupancy');
  });
});
