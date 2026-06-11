import { test, expect } from '@playwright/test';

test.describe('F1: Employee Registration & Preferences @tier1', () => {
  test('1. Test successful submission of preferences (preferred room type, gender preference) @tier1', async ({ page }) => {
    await page.goto('/registration');
    await page.fill('#preferredRoomType', 'Double');
    await page.selectOption('#genderPreference', 'Same');
    await page.click('#submitPreferences');
    await expect(page.locator('.success-message')).toBeVisible();
  });

  test('2. Test UI validation prevents submission with missing required fields @tier1', async ({ page }) => {
    await page.goto('/registration');
    // Don't fill required fields
    await page.click('#submitPreferences');
    await expect(page.locator('.error-message')).toHaveText(/required/i);
  });

  test('3. Test successful update of preferences @tier1', async ({ page }) => {
    await page.goto('/registration');
    await page.fill('#preferredRoomType', 'Single');
    await page.click('#updatePreferences');
    await expect(page.locator('.success-message')).toHaveText(/updated/i);
  });

  test('4. Test that gender preference constraints are correctly reflected in the UI options @tier1', async ({ page }) => {
    await page.goto('/registration');
    const options = await page.locator('#genderPreference option').allTextContents();
    expect(options).toContain('Same Gender');
    expect(options).toContain('No Preference');
  });

  test('5. Test that preferences become read-only/un-updatable after the event deadline passes @tier1', async ({ page }) => {
    await page.goto('/registration?time=post-deadline');
    await expect(page.locator('#preferredRoomType')).toBeDisabled();
    await expect(page.locator('#submitPreferences')).toBeHidden();
  });
});
