import { test, expect } from '@playwright/test';
import fs from 'fs';

test.describe('Tier 2: Boundary & Corner Cases - Feature 3 (Admin & Manager Capabilities)', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to admin dashboard as starting point
    await page.goto('/admin');
  });

  test('Test 1: Date Boundary Validation on Event Creation', async ({ page }) => {
    // Navigate to event creation
    await page.goto('/admin/events/new');

    const pastDate = new Date(Date.now() - 60000); // 1 minute in the past
    const futureDate = new Date(Date.now() + 60000); // 1 minute in the future

    // Format dates to datetime-local string format (YYYY-MM-DDThh:mm)
    const formatDateTime = (date: Date) => {
      return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
    };

    // Attempt to set deadline in the past
    await page.getByTestId('input-event-name').fill('Test Event Past');
    await page.getByTestId('input-event-deadline').fill(formatDateTime(pastDate));
    await page.getByTestId('submit-event').click();

    // Verify validation error
    const deadlineError = page.getByTestId('error-deadline');
    await expect(deadlineError).toBeVisible();

    // Change to future deadline
    await page.getByTestId('input-event-deadline').fill(formatDateTime(futureDate));
    await page.getByTestId('submit-event').click();

    // Verify success
    const successMsg = page.getByTestId('msg-success');
    await expect(successMsg).toBeVisible();
  });

  test('Test 2: Zero-state Auto-Allocation', async ({ page, request }) => {
    // API Setup: Create event
    const eventRes = await request.post('/api/events', {
      data: { name: 'Zero State Event' }
    });
    const event = await eventRes.json();
    const eventId = event.id;

    await page.goto(`/admin/allocation?eventId=${eventId}`);

    // Simulate clicking auto allocation when 0 users are unassigned
    await page.getByTestId('btn-auto-allocate').click();

    // Should process without error, show 0 allocations
    const allocationResult = page.getByTestId('allocation-result-msg');
    await expect(allocationResult).toBeVisible();
    await expect(allocationResult).toHaveText(/0/); // Mentions 0 allocations
  });

  test('Test 3: Auto-Allocation Capacity Breach (Over-capacity)', async ({ page, request }) => {
    // API Setup: Create event, 4 beds, 5 users
    const eventRes = await request.post('/api/events', {
      data: { name: 'Overcap Event' }
    });
    const event = await eventRes.json();
    const eventId = event.id;

    await request.post('/api/rooms', {
      data: { eventId, name: 'Room A', capacity: 4 }
    });

    for (let i = 0; i < 5; i++) {
      await request.post('/api/users', {
        data: { eventId, name: `User ${i}`, gender: 'unspecified' }
      });
    }

    // Navigate to a specific event's allocation page
    await page.goto(`/admin/allocation?eventId=${eventId}`);

    // Trigger auto-allocation
    await page.getByTestId('btn-auto-allocate').click();

    // Expect 4 users allocated, 1 user unassigned
    const unassignedCount = page.getByTestId('unassigned-count');
    await expect(unassignedCount).toHaveText('1');

    // Expect warning message
    const warningMsg = page.getByTestId('warning-capacity');
    await expect(warningMsg).toBeVisible();
  });

  test('Test 4: Auto-allocation Strict Gender Collision', async ({ page, request }) => {
    // API Setup: Create event, 1 bed room assigned to male, 1 unassigned female
    const eventRes = await request.post('/api/events', {
      data: { name: 'Gender Collision Event' }
    });
    const event = await eventRes.json();
    const eventId = event.id;

    const roomRes = await request.post('/api/rooms', {
      data: { eventId, name: 'Male Room', capacity: 1 }
    });
    const room = await roomRes.json();

    // Assign a male to the room to establish its gender
    await request.post('/api/users', {
      data: { eventId, name: 'Male User', gender: 'male', roomId: room.id }
    });

    // Create 1 unassigned female
    await request.post('/api/users', {
      data: { eventId, name: 'Female User', gender: 'female' }
    });

    // Navigate to a specific event's allocation page
    await page.goto(`/admin/allocation?eventId=${eventId}`);

    // Trigger auto-allocation
    await page.getByTestId('btn-auto-allocate').click();

    // Expect 1 female user remains unassigned
    const unassignedCount = page.getByTestId('unassigned-count');
    await expect(unassignedCount).toHaveText('1');

    // Allocation finishes with 0 successful allocations
    const allocationResult = page.getByTestId('allocation-result-msg');
    await expect(allocationResult).toHaveText(/0/);
  });

  test('Test 5: Occupancy Report Empty Boundary', async ({ page, request }) => {
    // API Setup: Create event
    const eventRes = await request.post('/api/events', {
      data: { name: 'Empty Event' }
    });
    const event = await eventRes.json();
    const eventId = event.id;

    // Navigate to a 0-participant event dashboard
    await page.goto(`/admin/events/${eventId}`);

    // Setup download listener
    const downloadPromise = page.waitForEvent('download');

    // Click export occupancy report
    await page.getByTestId('btn-export-occupancy').click();

    const download = await downloadPromise;
    const path = await download.path();
    
    // Read downloaded file
    const content = fs.readFileSync(path, 'utf8');
    const lines = content.trim().split('\n');

    // Verify only headers exist (1 line) or 0 data rows
    expect(lines.length).toBe(1);
  });

});
