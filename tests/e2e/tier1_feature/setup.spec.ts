import { test, expect } from '@playwright/test';

test('structural sanity - empty page url', async ({ page }) => {
  await page.goto('about:blank');
  expect(page.url()).toBe('about:blank');
});
