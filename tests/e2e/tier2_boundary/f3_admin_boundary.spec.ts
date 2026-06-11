import { test, expect } from '@playwright/test';

test.describe('Feature 3: Admin & Manager Capabilities - Boundary & Corner Cases', () => {

  test.beforeEach(async ({ page }) => {
    // Mock default admin session for tests that need it
    await page.route('**/api/auth/session', route => route.fulfill({
      status: 200,
      json: { user: { id: 999, role: 'admin', name: 'Admin User' } }
    }));
  });

  test('1. Auto-allocate when 0 rooms are available (capacity boundary)', async ({ page }) => {
    // Mock rooms API to return 0 available rooms
    await page.route('**/api/rooms/available', route => route.fulfill({ status: 200, json: [] }));
    await page.route('**/api/users/dont-care', route => route.fulfill({ status: 200, json: [{ id: 1, name: 'User 1', gender: 'male' }] }));
    
    // Mock the allocation endpoint to return an error about capacity
    await page.route('**/api/allocate/auto', route => route.fulfill({ status: 400, json: { error: 'No rooms available' } }));

    await page.goto('/admin/dashboard');
    
    // Trigger auto-allocation
    const allocateBtn = page.getByRole('button', { name: /auto-allocate/i });
    await allocateBtn.click();
    
    // Expect an error or warning message
    await expect(page.locator('.toast-error, .alert, .error-message')).toContainText(/no rooms available/i);
  });

  test('2. Auto-allocate when exactly 1 room is available and 2 users need it', async ({ page }) => {
    // Mock 1 room (capacity 1) and 2 users needing allocation
    await page.route('**/api/rooms/available', route => route.fulfill({ 
      status: 200, 
      json: [{ id: 101, number: '101', capacity: 1, gender: 'male', occupants: [] }] 
    }));
    await page.route('**/api/users/dont-care', route => route.fulfill({ 
      status: 200, 
      json: [
        { id: 1, name: 'User 1', gender: 'male' },
        { id: 2, name: 'User 2', gender: 'male' }
      ] 
    }));
    
    // Mock the allocation endpoint to return a partial success response
    await page.route('**/api/allocate/auto', route => route.fulfill({ 
      status: 200, 
      json: { success: true, allocated: 1, unallocated: 1, message: 'Partially allocated' } 
    }));

    await page.goto('/admin/dashboard');
    await page.getByRole('button', { name: /auto-allocate/i }).click();
    
    // Expect partial success or specific system behavior warning
    await expect(page.locator('.toast-info, .alert, .status-message')).toContainText(/partially allocated|not all users/i);
  });

  test('3. Accessing admin dashboard with a non-admin role', async ({ page }) => {
    // Mock user session as non-admin (employee)
    await page.route('**/api/auth/session', route => route.fulfill({
      status: 200,
      json: { user: { id: 1, role: 'employee', name: 'Regular User' } }
    }));

    await page.goto('/admin/dashboard');
    
    // Expect redirection to home/unauthorized or access denied message
    await page.waitForURL(/.*(\/dashboard|\/unauthorized|\/)/);
    
    const bodyText = await page.textContent('body');
    const isRedirected = page.url() === 'http://localhost:3000/' || page.url().includes('/unauthorized');
    const showsAccessDenied = /access denied|unauthorized/i.test(bodyText || '');
    
    expect(isRedirected || showsAccessDenied).toBeTruthy();
  });

  test('4. Exporting occupancy report when there are 0 users', async ({ page }) => {
    // Mock empty occupancy data
    await page.route('**/api/occupancy/report', route => route.fulfill({ status: 200, json: [] }));
    
    await page.goto('/admin/dashboard');
    
    // Attempt to export
    const exportBtn = page.getByRole('button', { name: /export/i });
    
    // The button should either be disabled, or clicking it should show a warning
    if (await exportBtn.isDisabled()) {
      expect(await exportBtn.isDisabled()).toBeTruthy();
    } else {
      await exportBtn.click();
      await expect(page.locator('.toast-warning, .alert, .warning-message')).toContainText(/no data/i);
    }
  });

  test('5. Triggering auto-allocation multiple times concurrently (race condition attempt)', async ({ page }) => {
    let requestCount = 0;
    
    // Delay the auto-allocation response to allow multiple clicks and track requests
    await page.route('**/api/allocate/auto', async route => {
      requestCount++;
      await new Promise(f => setTimeout(f, 1000));
      await route.fulfill({ status: 200, json: { success: true, allocated: 5 } });
    });

    await page.goto('/admin/dashboard');
    
    const allocateBtn = page.getByRole('button', { name: /auto-allocate/i });
    
    // Click multiple times rapidly
    await allocateBtn.click();
    await allocateBtn.click({ force: true });
    await allocateBtn.click({ force: true });
    
    // Verify that the button is disabled immediately after the first click
    await expect(allocateBtn).toBeDisabled();
    
    // Ensure only 1 API request was actually fired due to UI blocking it
    // Wait slightly to ensure any errant requests would have been caught
    await page.waitForTimeout(500);
    expect(requestCount).toBeLessThanOrEqual(1);
  });

});
